# Nextcloud app store action

Get metadata of the latest version of an app from Nextcloud app store.

## Inputs

### `app-id`

**Required** Nextcloud app ID.

### `server-major`

**Optional** Nextcloud server major version number (e.g. `31`)

## Outputs

### `version`

Latest version of the Nextcloud app

### `download`

Download URL for the version

## Example usage

```yaml
uses: mejo-/nextcloud-appstore-action
with:
  app-id: collectives
  server-major: 31
```

## Building

- `npm ci`
- `npm run build`

## License

[MIT License](LICENSE)
