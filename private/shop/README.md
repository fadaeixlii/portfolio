# private/shop

Paid downloads (`<product>.zip`) and free PDFs (`<name>.pdf`), see `src/content/shop.ts`. None of them is
committed (the repo is public) and none is under `public/`: a zip is served only through a paid order's download
link, a PDF only as the attachment of the email the free-PDF form sends. Locally drop them here for testing; in
production they live in `~/portfolio/shop/` on the VPS, which `docker-compose.prod.yml` mounts read-only over this
folder.
