"""Cut out product shots with rembg (isnet-general-use). Usage: cutout.py out_dir in1 in2 ..."""
import sys, os
from PIL import Image
from rembg import remove, new_session
Image.MAX_IMAGE_PIXELS=None
out=sys.argv[1]; s=new_session('isnet-general-use')
for f in sys.argv[2:]:
    im=Image.open(f).convert('RGB')
    if max(im.size)>2600: im.thumbnail((2600,2600),Image.LANCZOS)
    mask=remove(im,session=s,only_mask=True,post_process_mask=False)
    rgba=im.convert('RGBA'); rgba.putalpha(mask)
    name=os.path.basename(f).split('_')[0]+'_cut.png'
    rgba.save(os.path.join(out,name)); print(name,rgba.size,rgba.getbbox())
