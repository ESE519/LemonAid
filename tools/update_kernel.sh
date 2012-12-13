#!/bin/bash

# define your environments
################################################
### REQUIRED:
################################################

CC=arm-linux-gnueabihf-
BOARD=bone

#Specify the path of your SD card
#Note: This operates on raw disks, NOT PARTITIONS..
#
#WRONG: MMC=/dev/mmcblk0p1
#CORRECT: MMC=/dev/mmcblk0
#
#WRONG: MMC=/dev/sde1
#CORRECT: MMC=/dev/sde
MMC=/dev/mmcblk0

#For TI: OMAP3/4/AM35xx
ZRELADDR=0x80008000

#For Freescale: i.mx51:
#ZRELADDR=0x90008000

#For Freescale: i.mx53:
#ZRELADDR=0x70008000

#For Freescale: i.mx6:
#ZRELADDR=0x10008000

################################################
### OPTIONAL:
################################################

#specify location of locally cloned git tree,
#this will keep you from downloading all the time

LINUX_GIT=/home/mathew/beaglebone/linux-stable/ 



################################################
### START SCRIPT
################################################

CURRENT_DIRECTORY=`pwd`

if [ -z `ls | grep pcandriver` ] ; then
	echo "please change directory"
	if [ -e `pwd | grep -e LemonAid/tools$` ] ; then
		echo "please step out of 'tools' directory"
	fi
	exit 0
fi

echo "############################################################"
echo "############################################################"
echo "    Downloading Standard Customization Tools From github    "
echo "############################################################"
echo "############################################################"

LINUX_DEV=`ls -l | grep ^d | grep linux-dev`
if [ "${LINUX_DEV}" ] ; then
	echo "linux-dev already cloned"
	echo "Just in case, will clone it again"
	rm -rf ./linux-dev
fi

git clone git://github.com/RobertCNelson/linux-dev.git

cp ./tools/insert_pcandriver.sh ./linux-dev/scripts/
cd ./linux-dev/

echo "############################################################"
echo "############################################################"
echo "          Modifying the tools for LemonAid Project          "
echo "############################################################"
echo "############################################################"

cp ./scripts/git.sh ./scripts/git.sh_backup
cp ./build_kernel.sh ./build_kernel.sh_backup

sed "/cd \${DIR}\/$/a\/bin\/bash -e \"\${DIR}\/scripts\/insert_pcandriver.sh\"" ./scripts/git.sh_backup > ./scripts/git.sh
# sed "/copy_defconfig$/a/bin/bash -e \"\${DIR}/scripts/insert_pcandriver.sh\"" ./build_kernel.sh_backup > ./build_kernel.sh

sed "/For TI: OMAP3\/4\/AM35xx/aZRELADDR=`echo ${ZRELADDR}`" ./system.sh.sample > ./system.sh.sample1
sed "/ARM GCC CROSS Compiler.\+$/aCC=`echo ${CC}`" ./system.sh.sample1 > ./system.sh.sample2
sed "/#MMC=\/dev\/sde/aMMC=`echo ${MMC}`" ./system.sh.sample2 > ./system.sh.sample3
if [ "${LINUX_GIT}" ] ; then
	sed "/#LINUX_GIT=\/home\/user\/linux-stable\//aLINUX_GIT=`echo ${LINUX_GIT}`" ./system.sh.sample3 > ./system.sh.sample4
	cp ./system.sh.sample4 ./system.sh
else
	cp ./system.sh.sample3 ./system.sh
fi

cd ..

echo "##############################"
echo "##############################"
echo "    Downloading Ubuntu        "
echo "##############################"
echo "##############################"

pwd

if [ `ls -l | grep -e ^d | grep ubuntu | awk '{print $9}'` ] ; then
	echo "Find ubuntu directory already created"
else
	mkdir ./ubuntu
fi

cd ./ubuntu

UBUNTU_URL=`curl http://elinux.org/BeagleBoardUbuntu | grep -Eo href=\"\(http:\/\/rcn-ee\.net\/deb\/rootfs\/precise.\*\)\" | grep -Eo http:\/\/.\*tar\.xz`
UBUNTU_IMG=`ls *.tar.xz`

if [ `echo ${UBUNTU_URL} | grep -e ${UBUNTU_IMG}` ] ; then
	echo "Find latest ubuntu image already downloaded"
	UBUNTU_DIR=`ls -l | grep -e ^d | grep -e ubuntu | awk '{print $9}'`
	if [ "${UBUNTU_DIR}" ] ; then
		echo "Already unzipped"
	else
		echo "unzip image: ${UBUNTU_IMG}..."
		tar xJf ${UBUNTU_IMG}
		echo "ready to go: ${UBUNTU_DIR}"
	fi
else
	echo "Downloading latest ubuntu image"
	wget ${UBUNTU_URL}
	UBUNTU_IMG=`ls *.tar.xz`
	echo "unzip image: ${UBUNTU_IMG}..."
	tar xJf ${UBUNTU_IMG}
	echo "ready to go: ${UBUNTU_DIR}"
fi
cd ${CURRENT_DIRECTORY}

echo "##############################"
echo "##############################"
echo "     Ready to kernel update   "
echo "##############################"
echo "##############################"

cd ${CURRENT_DIRECTORY}/linux-dev
pwd
sh ./build_kernel.sh

echo "##############################"
echo "##############################"
echo "     Installing Ubuntu        "
echo "##############################"
echo "##############################"

cd ${CURRENT_DIRECTORY}/ubuntu
cd ${UBUNTU_DIR}

pwd

if [ "${MMC}" ] ; then
	if [ `ls /dev/ | grep ${MMC}` ] ; then
		echo "MMC set, ready to install image"
		/bin/bash -e 'setup_sdcard.sh --mmc /dev/${MMC} --uboot "${BOARD}"'
	else
		echo "Please insert your SD card"
	fi
else
	echo "Please specify the path to your SD card"
	/bin/bash -e 'setup_sdcard.sh --probe-mmc'
fi

cd ${CURRENT_DIRECTORY}

echo "##############################"
echo "##############################"
echo "     Installing Kernel        "
echo "##############################"
echo "##############################"

cd ${CURRENT_DIRECTORY}/linux-dev
pwd
sh ./tools/install_image.sh

echo "##############################"
echo "##############################"
echo "     Installing Library       "
echo "##############################"
echo "##############################"

