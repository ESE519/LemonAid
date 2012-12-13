//****************************************************************************
// Copyright (C) 2001-2009  PEAK System-Technik GmbH
//
// linux@peak-system.com 
// www.peak-system.com
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
// Maintainer(s): Klaus Hitschler (klaus.hitschler@gmx.de)
//****************************************************************************

//****************************************************************************
// receivetest.c - a small program to test the receive features of pcan driver 
//                 and the supporting shared library
//
// for example of realtime variant look at "receivetest_rt.c"
//
// $Id: receivetest.c 592 2009-06-07 21:04:25Z khitschler $
//
//****************************************************************************

// set here current release for this program
#define CURRENT_RELEASE "Release_20090203_n"

//****************************************************************************
// INCLUDE

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>   // exit
#include <signal.h>
#include <string.h>
#include <stdlib.h>   // strtoul
#include <fcntl.h>    // O_RDWR
#include <libpcan.h>
#include <src/common.h>
#include <src/helper.cpp>
#include <ctype.h>
#include <list>
#include <unistd.h>
#include <term.h>
#include <sqlite3.h>
#include <time.h>

//****************************************************************************
// DEFINES

#define DEFAULT_NODE "/dev/pcan0"
#ifndef bool
  #define bool  int
  #define true  1
  #define false 0
#endif

//****************************************************************************
// GLOBALS

HANDLE h;
const char *current_release;
int tripid = 0;
int engine = 0;

//****************************************************************************
// CODE

// what has to be done at program exit
void do_exit(int error)
{
  if (h) 
  {
    print_diag("receivetest");
    CAN_Close(h);
  }
  printf("receivetest: finished (%d).\n\n", error);
  exit(error);
}

// the signal handler for manual break Ctrl-C
void signal_handler(int signal)
{
  do_exit(0);
}

// what has to be done at program start
void init()
{
  /* install signal handlers */
  signal(SIGTERM, signal_handler);
  signal(SIGINT, signal_handler);
}

// open the CAN port
int open_can(bool bDevNodeGiven,bool bTypeGiven,const char *szDevNode,int nType,__u32 dwPort,__u16 wIrq)
{
  int err = 0;
  if ((bDevNodeGiven) || (!bDevNodeGiven && !bTypeGiven)) 
    h = LINUX_CAN_Open(szDevNode, O_RDWR);
  else 
  {
		// please use what is appropriate
		// HW_DONGLE_SJA
		// HW_DONGLE_SJA_EPP
		// HW_ISA_SJA
		// HW_PCI
		// HW_USB
    h = CAN_Open(nType, dwPort, wIrq);
  }
  if (!h) 
    return 1;
  
  return err;
}

void generate_entry(std::list<TPCANRdMsg> List, sqlite3 *db)
{
  int i;
	int16_t angel;
	int gearPos = 0,
			light = 0,
			turn = 0,
			//engine = 0,
			door = 0,
			driverDoor = 0,
			passengerDoor = 0,
			driverRear = 0,
			passengerRear = 0,
			fangle = 0,
			speed = 0,
			throttlePos = 0,
			fuel = 0,
			temp = 0,
			//tripid = 0,
			brake = 0,
			rpm = 0;

	char * sql = new char[200];

	std::list<TPCANRdMsg>::iterator it;
	for (it = List.begin(); it != List.end(); it++)
	{
		TPCANMsg *m = &(it->Msg);

		switch (m->ID)
		{
			case 0xD0:
				gearPos = ((m->DATA[2] & 0xF0) >> 4);
				printf("Gear Position: %03x ", m->ID);
				printf("%d \n", gearPos);
				break;
			case 0xC8:
				printf(" Light Status: %03x ", m->ID);
				printf("%02x\n", m->DATA[7]);
				light = m->DATA[7];
				break;
			case 0x310:
				printf("Turning Light: %03x ", m->ID);
				turn = ((m->DATA[4] & 0xC0) >> 6);
				switch ((m->DATA[4] & 0xC0) >> 4)
				{
					case 0x4:
						printf("LEFT  ");
						break;
					case 0x8:
						printf("RIGHT ");
						break;
					case 0xC:
						printf("PARK  ");
						break;
					default:
						break;
				}
				switch ((m->DATA[4] & 0x20) >> 4)
				{
					case 0x2:
						printf("ENGINE ON \n");
						break;
					case 0x0:
						printf("ENGINE OFF\n");
						break;
					default:
						break;
				}
				break;
			case 0x340:
				printf("Engine Status: %03x ", m->ID);
				switch (m->DATA[6])
				{
					case 0x6E:
						printf("ENGINE OFF\n");
						engine = 0;
						break;
					case 0x66:
						printf("ENGINE ON \n");
						if (engine == 0)
							tripid = tripid + 1;
						engine = 1;
						break;
					default:
						break;
				}
				break;
			case 0x360:
				printf("        Doors: %03x ", m->ID);
				printf("D: %01x P: %01x DR: %01x PR: %01x \n",
								(m->DATA[2] & 0x01) >> 0,
								(m->DATA[2] & 0x02) >> 1,
								(m->DATA[2] & 0x04) >> 2,
								(m->DATA[2] & 0x08) >> 3);
								driverDoor    = ((m->DATA[2] & 0x01) >> 0);
								passengerDoor = ((m->DATA[2] & 0x02) >> 1);
								driverRear    = ((m->DATA[2] & 0x04) >> 2);
								passengerRear = ((m->DATA[2] & 0x08) >> 3);
								door = m->DATA[2] & 0x0F;
				break;
			case 0x0B0:
				angel = (((m->DATA[5]) << 8) | (m->DATA[6]));
				angel = ~angel;
				fangle = (int)((double)angel / 32768.0 * 450.0);
				fangle = fangle>0 ? (fangle-450):(fangle+450);
				fangle = fangle * 3.0;
				printf("Steering angl: %03x ", m->ID);
				printf("%d \n", fangle);
				break;
			case 0x130:
				printf("        Speed: %03x ", m->ID);
				//printf("%d km/h\n", (((m->DATA[6]) << 8)|(m->DATA[7])));
				speed = (((m->DATA[6]) << 8)|(m->DATA[7]));
				speed = speed / 100;
			 	printf("%d km/h\n", speed);	
				break;
			case 0x080:
				printf(" throttle pos: %03x ", m->ID);
			 	throttlePos = (((m->DATA[0])&0x0F)<<8 | m->DATA[1])/10;
				if (throttlePos > 100) throttlePos = -1;	
				printf("%d percent\n", throttlePos);
				
				break;
			case 0x252:
				printf(" brake status: %03x ", m->ID);
				printf("%d\n", (((m->DATA[1])<<8)|(m->DATA[2]))/20);
				brake = (((m->DATA[1])<<8)|(m->DATA[2]))/20;
				break;
			case 0x90:
				printf("          RPM: %03x ", m->ID);
				rpm = (((m->DATA[4] & 0x0F) << 8) | (m->DATA[5]));
				rpm = rpm * 2;
				printf("%d \n", rpm);
				break;
			default:
				break;
		}
	}

	sprintf(sql, "insert into speedinfo values (%d, %d, %d, %d, %d, %d, \
					%d, %d, %d, %d, %d, %d, %d, %f, %f, %ld)",
					0,
					tripid,
					speed,
					rpm,
					throttlePos,
					fangle,
					gearPos,
					light,
					door,
					turn,
					brake,
					fuel,
					temp,
					300.0,
					300.0,
					time(NULL)	);

	int rc;
	char *zErrMsg = 0;
	
	rc = sqlite3_exec(db, sql, NULL, 0, &zErrMsg);
	while( rc!=SQLITE_OK ){
		fprintf(stderr, "SQL error: %s\n", zErrMsg);
		sleep(1);
		rc = sqlite3_exec(db, sql, NULL, 0, &zErrMsg);
	}
	delete sql;
}

// read from CAN forever - until manual break
int read_loop(bool display_on, sqlite3 *db)
{
  // read in endless loop until Ctrl-C
  while (1) 
  {
    TPCANRdMsg m;
    __u32 status;
    
    if ((errno = LINUX_CAN_Read(h, &m))) 
    {
      perror("receivetest: LINUX_CAN_Read()");
      return errno;
    }
    else 
    {
      if (List.empty())
      {
        List.push_back(m);
				print_period = 0;
      }
			else
			{
				std::list<TPCANRdMsg>::iterator iter;
				int i;
				bool replaceElem = 0;

				for (iter = List.begin(); iter != List.end(); iter++)
				{
					if (m.Msg.ID == (*iter).Msg.ID)
					{
						(*iter) = m;
						replaceElem = 1;
						break;
					}
				}
				if (!replaceElem) 
				{
					List.push_back(m);
				}
			}	
			if (display_on)
			{
				if (print_period == 399)
				{
					std::list<TPCANRdMsg>::iterator iter;
					ClearScreen();

					char* sql;
					int rc;
					char *zErrMsg = 0;
					
					generate_entry(List, db);

					//for (iter = List.begin(); iter != List.end(); iter++)
					//{
						//print_message(&((*iter).Msg));
					//	display_status(&((*iter).Msg));
					//}

					//for (iter = List.begin(); iter != List.end(); iter++)
					//{
					//	sprint_message(&((*iter).Msg), sql);
					//	rc = sqlite3_exec(db, sql, NULL, 0, &zErrMsg);
					//	while( rc!=SQLITE_OK ){
					//		fprintf(stderr, "SQL error: %s\n", zErrMsg);
					//		sleep(1);
					//		rc = sqlite3_exec(db, sql, NULL, 0, &zErrMsg);
					//	}
					//	print_message(&((*iter).Msg));
					//}

					print_period = 0;
					free(sql);
				}
				print_period = print_period + 1;
			}
      //if (display_on)
      //   print_message(&(m.Msg));
      // check if a CAN status is pending
      if (m.Msg.MSGTYPE & MSGTYPE_STATUS) 
      {
        status = CAN_Status(h);
        if ((int)status < 0) 
        {
          errno = nGetLastError();
          perror("receivetest: CAN_Status()");
          return errno;
        }
        else
          printf("receivetest: pending CAN status 0x%04x read.\n", (__u16)status);
      }
    }
  }

  return 0;
}

static void hlpMsg(void)
{
  printf("receivetest - a small test program which receives and prints CAN messages.\n");
  printf("usage:   receivetest {[-f=devicenode] | {[-t=type] [-p=port [-i=irq]]}} [-b=BTR0BTR1] [-e] [-?]\n");
  printf("options: -f - devicenode - path to devicefile, default=%s\n", DEFAULT_NODE);
  printf("         -t - type of interface, e.g. 'pci', 'sp', 'epp', 'isa', 'pccard' or 'usb' (default: pci).\n");
  printf("         -p - port in hex notation if applicable, e.g. 0x378 (default: 1st port of type).\n");
  printf("         -i - irq in dec notation if applicable, e.g. 7 (default: irq of 1st port).\n");
  printf("         -b - BTR0BTR1 code in hex, e.g. 0x001C (default: 500 kbit).\n");
  printf("         -e - accept extended frames. (default: standard frames)\n");
  printf("         -? or --help - this help\n");
  printf("\n");
}

// here all is done
int main(int argc, char *argv[])
{
  char *ptr;
  int i;
  //int nType = HW_PCI;
  int nType = HW_USB;
  __u32 dwPort = 0;
  __u16 wIrq = 0;
  __u16 wBTR0BTR1 = 0;
  int   nExtended = CAN_INIT_TYPE_ST;
  const char  *szDevNode = DEFAULT_NODE;
  bool bDevNodeGiven = false;
  bool bTypeGiven    = false;
  bool bDisplayOn    = true;
  char txt[VERSIONSTRING_LEN];
	sqlite3 *db;
	char *zErrMsg = 0;
	int rc;

	rc = sqlite3_open("test.db", &db);
	while( rc ){
		fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
		sqlite3_close(db);
		sleep(1);
		rc = sqlite3_open("test.db", &db);
	}

  errno = 0;

  current_release = CURRENT_RELEASE;
  disclaimer("receivetest");

  init();

  // decode command line arguments
  for (i = 1; i < argc; i++)
  {
    char c;

    ptr = argv[i];

    while (*ptr == '-')
      ptr++;

    c = *ptr;
    ptr++;

    if (*ptr == '=')
      ptr++;

    switch(tolower(c))
    {
      case 'f':
        szDevNode = ptr;
        bDevNodeGiven = true;
        break;
      case 'd':
        if (strcmp(ptr, "no") == 0)
          bDisplayOn = false;
        break;
      case 't':
        nType = getTypeOfInterface(ptr);
        if (!nType)
        {
          errno = EINVAL;
          printf("receivetest: unknown type of interface!\n");
          goto error;
        }
        bTypeGiven = true;
        break;
      case 'p':
        dwPort = strtoul(ptr, NULL, 16);
        break;
      case 'i':
        wIrq   = (__u16)strtoul(ptr, NULL, 10);
        break;
      case 'e':
        nExtended = CAN_INIT_TYPE_EX;
        break;
      case '?':
      case 'h':
        hlpMsg();
        goto error;
        break;
      case 'b':
        wBTR0BTR1 = (__u16)strtoul(ptr, NULL, 16);
        break;
      default:
        errno = EINVAL;
        perror("receivetest: unknown command line argument!\n");
        goto error;
        break;
    }
  }
  
  // simple command input check
  if (bDevNodeGiven && bTypeGiven)
  {
    errno = EINVAL;
    perror("receivetest: device node and type together is useless");
    goto error;
  }

  // give some information back
  if (!bTypeGiven)
  {
    printf("receivetest: device node=\"%s\"\n", szDevNode);
  }
  else
  {
    printf("receivetest: type=%s", getNameOfInterface(nType));
    if (nType == HW_USB)
    {
      if (dwPort)
        printf(", %d. device\n", dwPort);
      else
        printf(", standard device\n");
    }
    else{
      if (dwPort)
      {
        if (nType == HW_PCI)
          printf(", %d. PCI device", dwPort);
        else
          printf(", port=0x%08x", dwPort);
      }
      else
        printf(", port=default");
      if ((wIrq) && !(nType == HW_PCI))
        printf(" irq=0x%04x\n", wIrq);
      else
        printf(", irq=default\n");
    }
  }

  if (nExtended == CAN_INIT_TYPE_EX)
    printf("             Extended frames are accepted");
  else
    printf("             Only standard frames are accepted");
  if (wBTR0BTR1)
    printf(", init with BTR0BTR1=0x%04x\n", wBTR0BTR1);
  else
    printf(", init with 500 kbit/sec.\n");

  /* open CAN port */
  if ((bDevNodeGiven) || (!bDevNodeGiven && !bTypeGiven)) 
  {
    h = LINUX_CAN_Open(szDevNode, O_RDWR);
    if (!h)
    {
      printf("receivetest: can't open %s\n", szDevNode);
      goto error;
    }
  }
  else 
  {
    // please use what is appropriate  
    // HW_DONGLE_SJA 
    // HW_DONGLE_SJA_EPP 
    // HW_ISA_SJA 
    // HW_PCI 
    h = CAN_Open(nType, dwPort, wIrq);
    if (!h)
    {
      printf("receivetest: can't open %s device.\n", getNameOfInterface(nType));
      goto error;
    }
  }

  /* clear status */
  //  CAN_Status(h);

 // get version info
  errno = CAN_VersionInfo(h, txt);
  if (!errno)
    printf("receivetest: driver version = %s\n", txt);
  else {
    perror("receivetest: CAN_VersionInfo()");
    goto error;
  }

  // init to a user defined bit rate
  if (wBTR0BTR1)
  {
    errno = CAN_Init(h, wBTR0BTR1, nExtended);
    if (errno) 
    {
      perror("receivetest: CAN_Init()");
      goto error;
    }
  }
  errno = read_loop(bDisplayOn, db);
  if (!errno)
    return 0;

  error:
    do_exit(errno);
    return errno;
}
