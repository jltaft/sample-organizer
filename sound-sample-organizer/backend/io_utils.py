import os, shutil, librosa, time

# rename file
def rename(old, new, src_folder):
	old = os.path.join(src_folder, old)
	new = os.path.join(src_folder, new)
	os.rename(old, new)

# copy to folder
def copy_to(old, new, src_folder, dest_folder):
	old = os.path.join(src_folder, old)
	new = os.path.join(dest_folder, new)
	shutil.copyfile(old, new)

# creates group of subdirectories from a list of directory names
def make_subdirectories(dir_list, src_folder):
    for dir in dir_list:
        path = os.path.join(src_folder, dir)
        os.makedirs(path, exist_ok=True)

def move(name, src_folder, dest_folder):
    old = os.path.join(src_folder, name)
    new = os.path.join(dest_folder, name)
    shutil.move(old, new)