# Nextcloud app store action

Get metadata of the latest version of an app from Nextcloud app store.

## Inputs

### `appid`

**Required** Nextcloud app ID.

### `server_major`

**Optional** Nextcloud server major version number. (e.g. `31`)

## Outputs

### `release`

Metadata of the latest app release compatible with specified Nextcloud version

### `version`

Version of the release

### `download`

Download URL of the release

## Usage

The action looks for a local file `apps.json` and uses it if available. It only
fetches the file from the Nextcloud app store if it's not available locally.

When using the action, you should fetch `apps.json` yourself and cache it, to
not hit the rate limits from the app store.

Here is an example that caches `apps.json` for a maximum of one hour, retrieves
the Collectives app metadata using this action and then downloads the release
tarball:

```yaml
- name: Save current date and hour for the cache key
  run: echo "DATE_HOUR=$(date +"%Y-%m-%d-%H")" >> $GITHUB_ENV

- name: Restore appstore apps.json
  id: cache_appstore_apps
  uses: actions/cache@v4
  with:
    path: 'apps.json'
    key: 'appstore_apps_${{ env.DATE_HOUR }}'

- name: Fetch appstore repository
  if: ${{ steps.cache_appstore_apps.outputs.cache-hit != 'true' }}
  id: appstore_apps
  run: curl -fL -o 'apps.json' https://apps.nextcloud.com/api/v1/apps.json

- name: Get collectives app from app store
  id: collectives-app
  uses: mejo-/nextcloud-appstore-action@1873692fd1b3c198b3c57280462ed6ac7d6dde0a # v1.0.0
  with:
    appid: collectives
    server_major: 31

- name: Fetch collectives release tarball
  run: curl -fL -o '${{ runner.temp }}/collectives.tar.gz' '${{ steps.collectives-app.outputs.download }}'
```

## Building

- `npm ci`
- `npm run build`

## License

[MIT License](LICENSE)
