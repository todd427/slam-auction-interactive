# 🚀 Deployment Guide for slambridge.ie

## Quick Deploy to Railway (5 minutes)

### Step 1: Create GitHub Repository

```bash
cd slam-auction-interactive

# Initialize git
git init
git add .
git commit -m "Initial commit - SLAM Bridge MVP"

# Create repo on GitHub (github.com/new)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/slambridge.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Railway

1. **Go to:** https://railway.app/
2. **Sign up** with GitHub
3. **Click:** "New Project"
4. **Select:** "Deploy from GitHub repo"
5. **Choose:** Your slambridge repo
6. **Click:** Deploy

Railway will automatically:
- Detect Python app
- Install dependencies from requirements.txt
- Start your Flask server

---

### Step 3: Add Environment Variable

In Railway dashboard:

1. **Click** your project
2. **Go to:** Variables tab
3. **Add variable:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: `your-claude-api-key-here`
4. **Save**

App will auto-redeploy with the key.

---

### Step 4: Add Custom Domain

1. In Railway, go to **Settings** tab
2. Click **Generate Domain** (get free railway.app domain first)
3. Test it works: `https://your-app.railway.app`
4. Click **Custom Domain**
5. Enter: `slambridge.ie`
6. Copy the CNAME record Railway gives you

---

### Step 5: Point Your Domain

Go to your domain registrar (Blacknight, Namecheap, etc.):

**DNS Settings:**
```
Type: CNAME
Name: @
Value: [the value Railway gave you]
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: [the value Railway gave you]
TTL: 3600
```

**Wait 5-60 minutes for DNS to propagate.**

---

### Step 6: Enable HTTPS

Railway automatically handles SSL certificates!
Once DNS propagates, HTTPS will work automatically.

---

## ✅ You're Live!

Visit: **https://slambridge.ie** 🎉

---

## Alternative: Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
cd slam-auction-interactive
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? slambridge
# - Directory? ./
# - Build command? (leave empty)
# - Output directory? (leave empty)
```

### Step 3: Add Environment Variable

```bash
vercel env add ANTHROPIC_API_KEY
# Paste your Claude API key
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

### Step 5: Add Domain

```bash
vercel domains add slambridge.ie
```

Follow the prompts to configure DNS.

---

## Alternative: Deploy to DigitalOcean (Traditional VPS)

### Step 1: Create Droplet

1. Go to: https://digitalocean.com
2. Create Droplet:
   - Ubuntu 24.04
   - $6/month plan (1GB RAM)
   - Choose datacenter near Ireland

### Step 2: SSH In

```bash
ssh root@your-droplet-ip
```

### Step 3: Setup Server

```bash
# Update system
apt update && apt upgrade -y

# Install Python & dependencies
apt install -y python3 python3-pip nginx certbot python3-certbot-nginx

# Install Python packages
pip3 install flask flask-cors requests --break-system-packages
```

### Step 4: Upload Your Code

On your local machine:
```bash
scp -r slam-auction-interactive root@your-droplet-ip:/var/www/
```

### Step 5: Create Systemd Service

```bash
nano /etc/systemd/system/slambridge.service
```

Paste:
```ini
[Unit]
Description=SLAM Bridge Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/slam-auction-interactive
Environment="ANTHROPIC_API_KEY=your-api-key-here"
Environment="PORT=5000"
ExecStart=/usr/bin/python3 slam-backend.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Save and exit (Ctrl+X, Y, Enter)

### Step 6: Start Service

```bash
systemctl daemon-reload
systemctl start slambridge
systemctl enable slambridge
systemctl status slambridge
```

### Step 7: Configure Nginx

```bash
nano /etc/nginx/sites-available/slambridge.ie
```

Paste:
```nginx
server {
    listen 80;
    server_name slambridge.ie www.slambridge.ie;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:
```bash
ln -s /etc/nginx/sites-available/slambridge.ie /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Get SSL Certificate

```bash
certbot --nginx -d slambridge.ie -d www.slambridge.ie
```

Follow prompts, choose redirect HTTP to HTTPS.

### Step 9: Point DNS

In your domain registrar:

```
Type: A
Name: @
Value: your-droplet-ip
TTL: 3600

Type: A
Name: www
Value: your-droplet-ip
TTL: 3600
```

---

## 🎯 Which Should You Choose?

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Railway** | ⭐ Easy | $0-5/mo | MVP, quick start |
| **Vercel** | ⭐⭐ Easy | $0 | Static + serverless |
| **DigitalOcean** | ⭐⭐⭐ Medium | $6/mo | Full control |

**Recommendation: Start with Railway, move to DO later if needed.**

---

## 📋 Post-Deployment Checklist

After deploying:

- [ ] Test homepage loads: https://slambridge.ie
- [ ] Test Single Decision mode works
- [ ] Test Full Auction mode works (AI responds)
- [ ] Test Bridge 101 page loads
- [ ] Test tutorial works
- [ ] Test on mobile (responsive)
- [ ] Check HTTPS works (green padlock)
- [ ] Add to Google Search Console
- [ ] Set up analytics (Plausible/Umami)
- [ ] Share with 5 bridge-playing friends!

---

## 🆘 Troubleshooting

**"API key not set" error:**
- Make sure ANTHROPIC_API_KEY is set in environment variables
- Restart the service/redeploy

**"CORS error":**
- Should be handled by Flask-CORS, but if issue persists, check domain matches

**"502 Bad Gateway":**
- Backend crashed, check logs
- On Railway: View logs in dashboard
- On DO: `journalctl -u slambridge -f`

**Slow responses:**
- Check Claude API quotas
- Make sure using Haiku model (cheaper & faster)

---

## 🎉 You're Live!

**Next steps:**
1. Share with friends
2. Post on Reddit r/bridge
3. Email local bridge clubs
4. Start collecting feedback
5. Iterate and improve!

**Congratulations! 🚀**
