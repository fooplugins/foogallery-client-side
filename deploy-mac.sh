cp -R "dist/free/." "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/extensions/default-templates/shared"
cp -R "dist/pro/." "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/pro/extensions/default-templates/shared"

cp -R dist/components/js/foogallery.polyfills.* "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/extensions/default-templates/shared/js"
cp -R dist/components/js/foogallery.ready.* "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/extensions/default-templates/shared/js"

cp "dist/admin/css/foogallery.admin.min.css" "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/css/foogallery.admin.min.css"
cp "dist/admin/js/foogallery.admin.min.js" "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery/js/foogallery.admin.min.js"

cp -R dist/components/js/foogallery.social.* "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery-social/assets/js"
cp -R dist/components/css/foogallery.social.* "/Users/brad/Local Sites/foo/app/public/wp-content/plugins/foogallery-social/assets/css"
