# Port Configuration Options for CasaOS

If port 8000 is already in use, try these alternatives in your docker-compose file:

## Option 1: Port 8001 (Recommended)

```yaml
ports:
  - "8001:8000"
```

Access URL: http://your-casaos-ip:8001

## Option 2: Port 8080

```yaml
ports:
  - "8080:8000"
```

Access URL: http://your-casaos-ip:8080

## Option 3: Port 3001

```yaml
ports:
  - "3001:8000"
```

Access URL: http://your-casaos-ip:3001

## Option 4: Port 9001

```yaml
ports:
  - "9001:8000"
```

Access URL: http://your-casaos-ip:9001

## To Check What's Using Port 8000:

SSH into your CasaOS and run:

```bash
sudo netstat -tlnp | grep :8000
```

Or:

```bash
sudo ss -tlnp | grep :8000
```

## Common Services That Use Port 8000:

- Other Docker containers
- CasaOS services
- Development servers
- Other web applications
