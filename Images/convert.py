from PIL import Image

im = Image.open('level.jpg')
im.save('Overgrown3Plus.jpg', quality=50, optimize=True, progressive=True)