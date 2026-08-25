# Python-based CTF challenge container for MD5 collision service
FROM python:3.11-slim

# Ensure no .pyc and unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Copy challenge files into the image
COPY . .

# Create non-root user and fix permissions
RUN useradd -m ctf && chown -R ctf:ctf /app && chmod +x /app/entrypoint.sh
USER ctf

# Expose service port (must match server.py)
EXPOSE 5000

# Run the challenge service via entrypoint that sets FLAG
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "server.py"]
