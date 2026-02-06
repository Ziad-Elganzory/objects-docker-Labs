# 🐳 Lab 1 — Hacking the NGINX Container

This lab demonstrates **two ways** to modify the default NGINX web page inside a Docker container.

## Objectives
- Run an NGINX container
- Hack into it using `docker exec`
- Modify `index.html`
- Understand temporary vs permanent changes
- Learn how to use a Dockerfile

---

# Method 1 — Direct Pull from Docker Hub (Temporary)

Modify the container **from inside** using an interactive shell.

## Steps

### 1. Run the container
```bash
docker run -d --name nginx-lab -p 8080:80 nginx:latest
```

### 2. Open a shell inside the container
```bash
docker exec -it nginx-lab sh
```

### What does `-it` mean?
- `-i` → Interactive input
- `-t` → Allocate terminal (TTY)

This allows you to interact with the container like a normal shell.

---

### 3. Navigate to the web directory
```bash
cd /usr/share/nginx/html
```

### 4. Modify the page
```bash
echo "I Hacked This Container" > index.html
```

### 5. Exit
```bash
exit
```

### 6. Open in your browser
```
http://localhost:8080
```

---

## Note
This method is **NOT permanent**.  
If the container is removed, your changes will be lost.

---


# Method 2 — Using a Dockerfile (Permanent & Recommended)

Build a **custom image** with changes baked into it.

## Steps

### 1. Create `index.html` on your host
```bash
echo "I Hacked This Container From Dockerfile" > index.html
```

### 2. Create a Dockerfile
```bash
touch Dockerfile
```

### 3. Add the following content
```dockerfile
FROM nginx:latest

COPY index.html /usr/share/nginx/html/index.html
```

### 4. Build the image
```bash
docker build -t my-nginx .
```

### 5. Run the container
```bash
docker run -p 8080:80 my-nginx
```

### 6. Visit
```
http://localhost:8080
```

---

## Benefits of this method
- Permanent changes
- Reproducible builds
- Cleaner workflow
- Production ready
- No manual editing required

---

# 📊 Quick Comparison

| Method | Persistent | Best For |
|--------|-----------|-----------|
| docker exec | ❌ No | Learning / quick testing |
| Dockerfile | ✅ Yes | Production / automation |

---

# 🧹 Cleanup (Optional)

Stop and remove containers:

```bash
docker stop nginx-lab
docker rm nginx-lab
```

Remove image:

```bash
docker rmi my-nginx
```

---
