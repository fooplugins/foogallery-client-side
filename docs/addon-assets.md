# Addon Client Assets

FooGallery addons that extend frontend gallery behavior should keep their JavaScript and CSS source in this client repository, then copy the built assets into the addon plugin repository for distribution.

This keeps addon client code in the same build system as FooGallery core while allowing each addon to ship only the standalone files it needs.

## Source Layout

Place addon source under `src/core/js/<addon>/` and `src/core/css/<addon>/`.

Use the Social addon as the reference structure:

```text
src/core/js/social/Item.js
src/core/js/social/Panel.Likes.js
src/core/js/social/Panel.Media.js
src/core/js/social/Panel.Comments.js
src/core/js/social/Panel.Media.Comments.js

src/core/css/social/panel.css
src/core/css/social/item.css
src/core/css/social/panel-likes.css
src/core/css/social/media-share.css
src/core/css/social/media-comments.css
src/core/css/social/theme.css
```

The built Social assets are:

```text
dist/components/js/foogallery.social.js
dist/components/js/foogallery.social.min.js
dist/components/css/foogallery.social.css
dist/components/css/foogallery.social.min.css
```

Those files are copied into the Social addon:

```text
foogallery-social/assets/js/foogallery.social.js
foogallery-social/assets/js/foogallery.social.min.js
foogallery-social/assets/css/foogallery.social.css
foogallery-social/assets/css/foogallery.social.min.css
```

## Grunt Component Target

Each addon should have a `concat` target in `Gruntfile.js` that writes to `dist/components`.

The Social target is the model:

```js
"social": {
    "files": {
        "./dist/components/js/foogallery.social.js": [
            "./src/core/js/social/Item.js",
            "./src/core/js/social/Panel.Likes.js",
            "./src/core/js/social/Panel.Media.js",
            "./src/core/js/social/Panel.Comments.js",
            "./src/core/js/social/Panel.Media.Comments.js"
        ],
        "./dist/components/css/foogallery.social.css": [
            "./src/core/css/social/panel.css",
            "./src/core/css/social/item.css",
            "./src/core/css/social/panel-likes.css",
            "./src/core/css/social/media-share.css",
            "./src/core/css/social/media-comments.css",
            "./src/core/css/social/theme.css"
        ]
    }
}
```

After `concat`, the shared `uglify:dist` and `cssmin:dist` tasks create the `.min.js` and `.min.css` files.

## Build Commands

Run the full client build when changing assets that need all FooGallery bundles:

```sh
npm install
npm run build
```

The full build creates component files under `dist/components`, then builds the Free and Pro FooGallery bundles and local test-page assets. `dist/` and test-page build outputs are generated and are not committed in this repository.

For addon-only tasks, add a focused Grunt task that builds only that addon and copies the result into the addon repo. The 3D Walkthrough addon uses this pattern:

```sh
npx grunt 3d-walkthrough
```

That task runs:

```text
clean:dist
concat:3d-walkthrough
uglify:dist
cssmin:dist
copy:3d-walkthrough-addon
```

## Copying Built Assets To Addons

Addon distribution assets live in the addon plugin repo under `assets/js` and `assets/css`. Treat those files as build outputs, not source.

If the addon does not have a dedicated copy task, copy the four component files from `dist/components` to the matching addon asset paths:

```sh
cp dist/components/js/foogallery.social.js ../foogallery-social/assets/js/
cp dist/components/js/foogallery.social.min.js ../foogallery-social/assets/js/
cp dist/components/css/foogallery.social.css ../foogallery-social/assets/css/
cp dist/components/css/foogallery.social.min.css ../foogallery-social/assets/css/
```

For new addons, prefer adding a named `copy:<addon>` target so the workflow is repeatable and less error-prone.

## Addon Enqueue Pattern

The addon plugin should enqueue its copied files through FooGallery feature dependency filters:

```php
add_filter( 'foogallery_feature_script_deps', array( $this, 'register_feature_scripts' ) );
add_filter( 'foogallery_feature_style_deps', array( $this, 'register_feature_styles' ) );
```

Use `foogallery_is_debug()` to choose unminified or minified files:

```php
$suffix = function_exists( 'foogallery_is_debug' ) && foogallery_is_debug() ? '' : '.min';
```

Scripts should depend on `foogallery-core`. Add extra WordPress script dependencies only when the addon source actually uses them. Social, for example, depends on `wp-hooks` and `wp-api-fetch` because its client code calls WordPress APIs.

## Development Checklist

1. Add or update source files in `src/core/js/<addon>/` and `src/core/css/<addon>/`.
2. Add or update the addon `concat` target in `Gruntfile.js`.
3. Add a focused addon build/copy task when the addon has a matching local plugin repo.
4. Run the addon build task, or run `npm run build` and copy `dist/components` files manually.
5. Commit source changes in this client repo.
6. Commit copied built assets in the addon repo.
7. If FooGallery contains this client repo as a submodule, commit the updated submodule pointer in the parent FooGallery repo.
8. Smoke-test a gallery with the addon active and confirm the addon asset URLs load from the addon plugin, not from `dist/components`.

## Rules Of Thumb

- Keep client source in this repo.
- Do not hand-edit addon `assets/js` or `assets/css` unless doing an emergency generated-file patch.
- Commit addon assets in the addon repo because those are what ships in the addon ZIP.
- Keep `dist/` uncommitted in this repo.
- Keep addon scripts standalone. They should extend FooGallery at runtime through public extension points such as item parsing, template configuration, panel media registration, and feature dependency hooks.
