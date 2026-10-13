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

Clone the repository, edit the files, commit, and push to `main`. Once the
following setup is complete, GitHub Actions deploys that exact commit to the
server automatically. You can also run **Deploy website** from the Actions tab.

## Automatic deployment setup (GitHub Actions)

The server must already have the repository cloned at `/root/plugsmy-website`,
Docker with the Compose plugin, Git, Bash and curl installed, and network access
to fetch `origin`. For a private repository, configure a read-only deploy key on
the server. The SSH user needs write access to the checkout and permission to run
Docker. The existing host Nginx/HTTPS configuration stays in use.

In GitHub **Settings → Secrets and variables → Actions**, add repository secrets:

- `DEPLOY_HOST`: the server's public hostname or IPv4 address.
- `DEPLOY_USER`: the SSH user that owns the server checkout.
- `DEPLOY_SSH_KEY`: a dedicated private SSH key whose public key is installed in
  that user's `~/.ssh/authorized_keys` on the server with
  `restrict,command="/root/.ssh/plugsmy-deploy-command"`. This key can only run
  `deploy <commit SHA>`; interactive shells and forwarding are disabled.
- `DEPLOY_KNOWN_HOSTS`: the server's SSH host-key entry, verified against its
  fingerprint through your server console or another trusted channel. For a
  custom port, use the `[hostname]:port` known-hosts format.

Optional repository variables:

- `DEPLOY_PORT`: defaults to `22`.
- `DEPLOY_PATH`: defaults to `/root/plugsmy-website`; use an absolute path without
  spaces. The forced-command wrapper is fixed to this directory; update the
  server wrapper as well if moving the checkout.

The server uses copies of `scripts/ssh-deploy-command.sh` and `scripts/deploy.sh`
at `/root/.ssh/plugsmy-deploy-command` and `/root/.ssh/plugsmy-deploy.sh`.
These files must be installed by an administrator, with modes 700 and 600
respectively. Updating their repository copies does not update the server copies.

The workflow serializes deployments, checks SSH host keys, refuses to overwrite
local server edits, updates the checkout to the triggering commit, runs Docker
Compose and checks HTTP on port 3023. A failed health check marks the run failed;
it does not automatically roll back. To restore a previous site, revert the bad
commit on `main` and push the revert. SSH must be reachable from GitHub-hosted
runners. Deployment starts when this workflow is committed and pushed to the
GitHub repository with the secrets configured.
