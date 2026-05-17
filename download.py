import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# A royalty-free Cyberpunk/Synthwave track that perfectly matches the Blade Runner vibe
url = "https://cdn.pixabay.com/download/audio/2022/10/25/audio_51d20ec08b.mp3?filename=cyberpunk-2099-10701.mp3"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req, context=ctx) as response:
    with open("cyberpunk.mp3", "wb") as f:
        f.write(response.read())

print("Downloaded cyberpunk.mp3 successfully")
