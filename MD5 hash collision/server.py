#!/usr/bin/env python3
import hashlib
import os
import socket
import time
import signal
import sys
from concurrent.futures import ThreadPoolExecutor

FLAG = os.environ.get("FLAG", "CTF{hashes_are_not_signatures}")
HOST = "0.0.0.0"
PORT = 5000
KNOWN_PREFIX = b"trusted_data:"
HASH_LEN = 7
MAX_WORKERS = 200

def handle_client(conn):
    try:
        conn.settimeout(300)
        
        reference = KNOWN_PREFIX + os.urandom(64)
        ref_hash = hashlib.md5(reference).hexdigest()[:HASH_LEN]

        conn.sendall(b"== Hash Verification Service ==\n")
        conn.sendall(f"Hash algorithm: MD5 (first {HASH_LEN} hex chars)\n".encode())
        conn.sendall(b"All inputs must begin with the following prefix:\n")
        conn.sendall(KNOWN_PREFIX + b"\n")
        conn.sendall(b"Reference hash:\n")
        conn.sendall(ref_hash.encode() + b"\n\n")

        while True:
            conn.sendall(b"Submit input (or 'quit' to exit):\n")
            data = conn.recv(4096)
            if not data:
                break
            data = data.strip()
            if data.lower() == b"quit":
                conn.sendall(b"Goodbye.\n")
                break
            if not data.startswith(KNOWN_PREFIX):
                conn.sendall(b"Invalid input: must start with the known prefix.\n\n")
                continue

            user_hash = hashlib.md5(data).hexdigest()[:HASH_LEN]

            if user_hash == ref_hash and data != reference:
                conn.sendall(b"Collision detected.\n")
                conn.sendall(b"FLAG: " + FLAG.encode() + b"\n")
                break
            elif user_hash == ref_hash and data == reference:
                conn.sendall(b"Nice!!!! You found the original input!!! :D Here is the flag...")
                conn.sendall(b"FLAG: CTF{h4sh1ng_1s_s0_much_fun_h4h4h4}\n")
                for dots in [".", "..", "...", ".....", "......"]:
                    time.sleep(1)
                    conn.sendall(dots.encode() + b"\n")
                conn.sendall(b"Just kidding LMAOOOOOOOOOO. You need to find a collision\n")
                break
            else:
                conn.sendall(b"Invalid input.\n\n")
    except (socket.timeout, BrokenPipeError, ConnectionResetError):
        pass  # Client disconnected, no big deal
    except Exception as e:
        print(f"Client error: {e}", flush=True)
    finally:
        try:
            conn.close()
        except:
            pass

def main():
    # Ignore broken pipe signals
    signal.signal(signal.SIGPIPE, signal.SIG_IGN)
    
    while True:  # Outer loop restarts server if something goes wrong
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                s.bind((HOST, PORT))
                s.listen(256)
                print(f"Listening on {PORT} (max {MAX_WORKERS} concurrent)...", flush=True)

                with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
                    while True:
                        try:
                            conn, addr = s.accept()
                            pool.submit(handle_client, conn)
                        except Exception as e:
                            print(f"Accept error: {e}", flush=True)
        except Exception as e:
            print(f"Server crashed: {e}, restarting in 2s...", flush=True)
            time.sleep(2)

if __name__ == "__main__":
    main()