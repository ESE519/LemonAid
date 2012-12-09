#****************************************************************************
# Copyright (C) 2001-2010  PEAK System-Technik GmbH
#
# linux@peak-system.com
# www.peak-system.com
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
# Maintainer(s): Klaus Hitschler (klaus.hitschler@gmx.de)
#****************************************************************************

#****************************************************************************
#
# Makefile - Makefile for receivetest and transmittest programs
#
# $Id: Makefile 616 2010-02-14 22:41:17Z khitschler $
#
#****************************************************************************

SRC     = src
INC     = -I. -I../lib -I../driver
RT      = NO_RT


ifeq ($(RT), XENOMAI)
SKIN = xeno
### Xenomai directory, xeno-config and library directory ###########
RT_DIR          ?= /usr/xenomai
RT_CONFIG       ?= $(RT_DIR)/bin/xeno-config
RT_LIB_DIR      ?= $(shell $(RT_CONFIG) --library-dir) -Wl,-rpath $(shell $(RT_CONFIG) --library-dir)
### User space application compile options #########################
USERAPP_LIBS      ?= -lnative -lpcan
USERAPP_LDFLAGS   ?= $(shell $(RT_CONFIG) --$(SKIN)-ldflags) -L$(RT_LIB_DIR)
USERAPP_CFLAGS    ?= $(shell $(RT_CONFIG) --$(SKIN)-cflags)
endif

ifeq ($(RT), RTAI)
SKIN = lxrt
### Rtai directory, rtai-config and library directory ###########
RT_DIR          ?= /usr/realtime
RT_CONFIG       ?= $(RT_DIR)/bin/rtai-config
RT_LIB_DIR      ?= $(shell $(RT_CONFIG) --library-dir) -Wl,-rpath $(shell $(RT_CONFIG) --library-dir)
### User space application compile options #########################
USERAPP_LIBS      ?= -llxrt -lpcan
USERAPP_LDFLAGS   ?= $(shell $(RT_CONFIG) --$(SKIN)-ldflags) -L$(RT_LIB_DIR)
USERAPP_CFLAGS    ?= $(shell $(RT_CONFIG) --$(SKIN)-cflags)
endif

ifeq ($(RT), NO_RT)
  USERAPP_LIBS = -lpcan
endif

ifeq ($(HOSTTYPE),x86_64)
  LDLIBS  = -L../lib -L/lib64 -L/usr/lib64 -L/usr/local/lib64
else
  LDLIBS  = -L../lib -L/lib -L/usr/lib -L/usr/local/lib
endif

# enabling corss-compile from ../Makefile
ifneq ($(CROSS_COMPILE),)
  LDLIBS  = -L../lib
endif

ifneq ($(RT), NO_RT)
DBGFLAGS   =
else
DBGFLAGS   = -g
endif

ifeq ($(DBG), DEBUG)
CFLAGS  = $(DBGFLAGS) $(INC) $(LDLIBS)
else
CFLAGS  = $(INC) $(LDLIBS)
endif

# take different source files for realtime and 'normal' test programms

TARGET8 = monitorsqlprius
TARGETNAME8 = canmonitorprius
FILES8  = $(SRC)/$(TARGET8).cpp $(SRC)/common.c

TARGET7 = monitorsql
TARGETNAME7 = canmonitor
FILES7  = $(SRC)/$(TARGET7).cpp $(SRC)/common.c

TARGET6 = monitortest
TARGETNAME6 = cansniffer
FILES6  = $(SRC)/$(TARGET6).cpp $(SRC)/common.c

TARGET1 = receivetest
TARGETNAME1 = canreceiver
FILES1  = $(SRC)/$(TARGET1).c $(SRC)/common.c

TARGET2 = transmitest
TARGETNAME2 = cantransmitter
FILES2  = $(SRC)/$(TARGET2).cpp $(SRC)/common.c $(SRC)/parser.cpp

TARGET4 = filtertest
TARGETNAME4 = canfilter
FILES4  = $(SRC)/$(TARGET4).cpp $(SRC)/common.c

all:    $(TARGET1) $(TARGET2) $(TARGET4) $(TARGET6) $(TARGET7) $(TARGET8)

$(TARGET1): $(FILES1)
	$(CC) $(FILES1) $(CFLAGS) -o $(TARGETNAME1) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS)

$(TARGET2): $(FILES2)
	$(CC) $(FILES2) $(CFLAGS) -o $(TARGETNAME2) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS) -lstdc++ 
	
$(TARGET4): $(FILES4)
	$(CC) $(FILES4) $(CFLAGS) -o $(TARGETNAME4) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS) -lstdc++

$(TARGET6): $(FILES6)
	$(CC) $(FILES6) $(CFLAGS) -o $(TARGETNAME6) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS) -lstdc++ -lcurses
		
$(TARGET7): $(FILES7)
	$(CC) $(FILES7) $(CFLAGS) -o $(TARGETNAME7) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS) -lstdc++ -lcurses `mysql_config --cflags --libs`

$(TARGET8): $(FILES8)
	$(CC) $(FILES8) $(CFLAGS) -o $(TARGETNAME8) $(USERAPP_CFLAGS) $(USERAPP_LDFLAGS) $(USERAPP_LIBS) -lstdc++ -lcurses `mysql_config --cflags --libs`
	
clean:
	rm -f $(SRC)/*~ $(SRC)/*.o *~ $(TARGET1) $(TARGET2) $(TARGET4) $(TARGET6) $(TARGET7) $(TARGET8)
	
install:
	cp $(TARGET1) /usr/local/bin
	cp $(TARGET2) /usr/local/bin
	cp $(TARGET4) /usr/local/bin
	cp $(TARGET6) /usr/local/bin
	cp $(TARGET7) /usr/local/bin
	cp $(TARGET8) /usr/local/bin

uninstall:
	@-rm -f /usr/local/bin/$(TARGET1)
	@-rm -f /usr/local/bin/$(TARGET2)
	@-rm -f /usr/local/bin/$(TARGET4)
	@-rm -f /usr/local/bin/$(TARGET6)
	@-rm -f /usr/local/bin/$(TARGET7)
	@-rm -f /usr/local/bin/$(TARGET8)
