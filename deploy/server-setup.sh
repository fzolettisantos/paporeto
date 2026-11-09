#!/usr/bin/env bash
# Prepara um VPS Ubuntu 24.04 para o Papo Reto Ranking. Rode UMA vez, como root,
# no "Terminal do navegador" do painel do VPS. Pode rodar de novo sem estragar nada.
set -euo pipefail

echo "==> Atualizando o sistema e ativando atualizações de segurança automáticas"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl rsync ufw unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Instalando o Docker"
if ! command -v docker >/dev/null; then curl -fsSL https://get.docker.com | sh; fi
systemctl enable --now docker

echo "==> Criando o usuário de publicação (deploy)"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /opt/paporeto && chown deploy:deploy /opt/paporeto

echo "==> Gerando a chave de acesso da publicação automática"
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
if [ ! -f /home/deploy/.ssh/deploy_key ]; then
  sudo -u deploy ssh-keygen -t ed25519 -N "" -C "paporeto-github-deploy" -f /home/deploy/.ssh/deploy_key
fi
grep -qf /home/deploy/.ssh/deploy_key.pub /home/deploy/.ssh/authorized_keys 2>/dev/null \
  || cat /home/deploy/.ssh/deploy_key.pub >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys

echo "==> Firewall: só SSH, HTTP e HTTPS"
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 443/udp
ufw --force enable

IP=$(curl -fsS https://api.ipify.org || hostname -I | awk '{print $1}')
cat <<MSG

==================================================================
 Pronto! Agora, no GitHub (repositório paporeto):
 Settings → Secrets and variables → Actions → New repository secret

   VPS_HOST     = $IP
   VPS_USER     = deploy
   VPS_SSH_KEY  = (todo o texto abaixo, das linhas BEGIN até END)

MSG
cat /home/deploy/.ssh/deploy_key
echo "=================================================================="
