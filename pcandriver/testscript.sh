#!/bin/bash

rm -rf ./src

mkdir ./src
cp ./*.[ch] ./src

for file in `ls ./src | grep pcan`
do
	sed 's/<\(pcan_\w\+.h\)>/"\1"/' ./src/${file} > ./src/${file}_1
	sed 's/<\(pcan.h\)>/"\1"/' ./src/${file}_1 > ./src/${file}_2
	sed 's/<\(can.h\)>/"\1"/' ./src/${file}_2 > ./src/${file}_3
	sed 's/<\(error.h\)>/"\1"/' ./src/${file}_3 > ./src/${file}_4
	mv ./src/${file}_4 ./${file}
done

mv ./pcan_common.h ./pcan_common.h_1

sed '/#define __PCAN_COMMON_H__/a#define NO_RT' ./pcan_common.h_1 > ./pcan_common.h_2
sed '/#define __PCAN_COMMON_H__/a#define USB_SUPPORT' ./pcan_common.h_2 > ./pcan_common.h_3

cp ./pcan_common.h_3 ./pcan_common.h

rm ./pcan_common.h_*

rm -rf ./src
