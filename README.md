# plugs.my

Plugsmy company website, built with plain HTML and CSS.

## Local preview

Run `python3 -m http.server 8000 --directory site` and open http://localhost:8000.
Edit `site/index.html` and `site/styles.css`, then refresh the browser.

## Docker deployment

Run `docker compose up -d`. The site is available at http://127.0.0.1:3023.
Host Nginx routes plugs.my and www.plugs.my to this port and terminates HTTPS.
The website files are mounted read-only; content edits take effect immediately.

## Laptop checkout

Clone the repository, edit the files, commit, and push. On the server, pull the
changes into /root/plugsmy-website. Container recreation is only necessary when
changing docker-compose.yml.
