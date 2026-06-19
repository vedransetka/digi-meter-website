# DIGI-METER multilingual site

The current hand-built site remains in `html output/` as the design source. Eleventy generates an equivalent route tree for English, Greek, German, French, Dutch, and European Portuguese. Extracted text lives in `content/pages/<locale>/` and can be edited through Sveltia CMS.

## Local development

```sh
npm install
npm run migrate
npm run serve
```

The generated site is written to `_site/`. Open `/admin/` for the CMS.

## CMS setup

Replace the placeholder repository in `src/admin/config.yml`, configure a GitHub OAuth application and deploy the Sveltia CMS Authenticator. The CMS stores each locale in its own folder. English `source` and translated `value` are intentionally kept together in each text item so translators always have source context.

## Translation workflow

1. Select a page and locale in the CMS.
2. Translate each `Translation` value; do not change internal keys.
3. Translate accessibility/image text as well as visible page text.
4. Change the status to `reviewed` only after language review.
5. Save; the Git commit triggers the static-site deployment.

Run `npm run migrate -- --force` only when intentionally re-extracting all content from the original HTML; it overwrites translations.

## Deployment settings

- Build command: `npm run build`
- Output directory: `_site`
- Set `RESEND_API_KEY`, `MAIL_FROM`, and `MAIL_TO` for the contact/newsletter endpoint.
- `MAIL_FROM` must use a sender domain verified in Resend.
- Configure the GitHub repository and OAuth settings before sharing `/admin/` with editors.
