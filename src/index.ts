import * as core from '@actions/core';
import { access, readFile, writeFile } from 'node:fs/promises';
import semver from 'semver';

const appStoreUrl = 'https://apps.nextcloud.com/api/v1/apps.json';

const appsFile = 'apps.json';

interface Release {
	download: string,
	isNightly: boolean,
	platformVersionSpec: string,
	rawPlatformVersionSpec: string,
	version: string,
}

async function fetchAppStore(): Promise<Response> {
	const response = await fetch(appStoreUrl, {
		headers: {
			'User-Agent': 'NextcloudAppstoreGithubAction/1.0.0',
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch app store repository: ${response.status}`);
	}
	return response;
}

async function getAppStore(): Promise<Array<any>> {
	try {
		await access(appsFile);
	} catch (error) {
		core.info('Apps file not found, fetching from app store')
		const response = await fetchAppStore();
		await writeFile(appsFile, await response.text());
	}

	return JSON.parse(await readFile(appsFile, 'utf8'));
}

try {
	const appId = core.getInput('app-id');
	const serverMajor = core.getInput('server-major');
	core.info(`appId: ${appId}`);
	core.info(`serverMajor: ${serverMajor}`);

	const appStore = await getAppStore();

	const appReleases: Array<Release> = appStore.filter((app) => app.id === appId)[0].releases;
	let filteredReleases = appReleases
		// Ignore nightly releases
		.filter((r: Release) => !r.isNightly)
		// Ignore releases that don't follow semantic versioning
		.filter((r: Release) => !!semver.valid(r.version))
		// Consider only releases compatible with major server version
		.filter((r: Release) => serverMajor === '' || semver.satisfies(semver.coerce(serverMajor) ?? '', r.rawPlatformVersionSpec));
	let latestRelease = filteredReleases.reduce((r1: Release, r2: Release) => semver.gt(r2.version, r1.version) ? r2 : r1);

    core.info(`version: ${latestRelease.version}`);
    core.info(`download: ${latestRelease.download}`);
	core.setOutput('release', latestRelease);
	core.setOutput('version', latestRelease.version);
	core.setOutput('download', latestRelease.download);
} catch (error: any) {
	core.setFailed(error.message);
}
