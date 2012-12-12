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
//
// common.c - common parts for transmittest and receivetest
//
// $Id: common.c 558 2009-02-03 19:05:46Z khitschler $
//
//****************************************************************************

//****************************************************************************
// INCLUDES
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>   // exit
#include <signal.h>
#include <string.h>
#include <stdlib.h>   // strtoul
#include <src/common.h> 

//****************************************************************************
// DEFINES

//****************************************************************************
// GLOBALS

//****************************************************************************
// LOCALS

//****************************************************************************
// CODE 

// print GPL disclaimer
void disclaimer(const char *prgName)
{
  printf("\n");
  printf("%s Version \"%s\"  (www.peak-system.com)\n", prgName, "Real Tough Time Embedded Programming");
  printf("------- Copyright (C) 2004-2009 PEAK System-Technik GmbH ------\n");
  printf("%s comes with ABSOLUTELY NO WARRANTY.     This is free\n", prgName);
  printf("software  and you are welcome  to redistribute it under certain\n");
  printf("conditions.   For   details   see    attached   COPYING   file.\n");
  printf("\n"); 
} 
 
// print out the contents of a CAN message  
void display_status(TPCANMsg *m)
{
  int i;

	switch (m->ID)
	{
		case 0xD0:
			printf("Gear Position: %03x ", m->ID);
			printf("%02x\n", m->DATA[2]);
			break;
		case 0xC8:
			printf(" Light Status: %03x ", m->ID);
			printf("%02x\n", m->DATA[7]);
			break;
		case 0x310:
			printf("Turning Light: %03x ", m->ID);
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
			}
			switch ((m->DATA[4] & 0x20) >> 4)
			{
				case 0x2:
					printf("ENGINE ON \n");
					break;
				case 0x0:
					printf("ENGINE OFF\n");
					break;
			}
			break;
		case 0x340:
			printf("Engine Status: %03x ", m->ID);
			switch (m->DATA[6])
			{
				case 0x6E:
					printf("ENGINE OFF\n");
					break;
				case 0x66:
					printf("ENGINE ON \n");
					break;
			}
		case 0x360:
			printf("        Doors: %03x ", m->ID);
			printf("D: %01x P: %01x DR: %01x PR: %01x \n",
							(m->DATA[2] & 0x01) >> 0,
							(m->DATA[2] & 0x02) >> 1,
							(m->DATA[2] & 0x04) >> 2,
							(m->DATA[2] & 0x08) >> 3);
			break;
		case 0x0B0:
		{
			int16_t angel;
			angel = (((m->DATA[5]) << 8) | (m->DATA[6]));
			int fangle = (int)((double)angel / 32768.0 * 450.0);
			printf("Steering angl: %03x ", m->ID);
			printf("%d \n", fangle);
			break;
		}
		case 0x130:
			printf("        Speed: %03x ", m->ID);
			printf("%d km/h\n", (((m->DATA[6]) << 8)|(m->DATA[7])));
			break;
		case 0x80:
			printf(" throttle pos: %03x ", m->ID);
			printf("%d percent\n", ((m->DATA[1]) >> 1));
			break;
		case 0x180:
			printf(" brake status: %03x ", m->ID);
			printf("%d\n", ((m->DATA[2] & 0xF0) >> 4));
			break;
		case 0x90:
		{
			printf("          RPM: %03x ", m->ID);
			int rpm = (((m->DATA[4] & 0x0F) << 8) | (m->DATA[5]));
			rpm = rpm * 2;
			printf("%d \n", rpm);
			break;
		}
		default:
			break;
	}
  
}

// print out the contents of a CAN message  
void print_message(TPCANMsg *m)
{
  int i;
  
  // print RTR, 11 or 29, CAN-Id and datalength
//  printf("receivetest: %c %c 0x%08x %1d ", 
  printf("receivetest: %c %c %03x %1d ", 
      (m->MSGTYPE & MSGTYPE_RTR)      ? 'r' : 'm',
      (m->MSGTYPE & MSGTYPE_EXTENDED) ? 'e' : 's',
       m->ID, 
       m->LEN); 

	// don't print any telegram contents for remote frames
  if (!(m->MSGTYPE & MSGTYPE_RTR))
  	for (i = 0; i < m->LEN; i++)
    	printf("%02x ", m->DATA[i]);
    
  printf("\n");
}

// print out the contents of a CAN message to a string
void sprint_message(TPCANMsg *m, char* sql)
{
  int i;
	char *data;
	
	// don't print any telegram contents for remote frames
  asprintf(&data, "%02x%02x%02x%02x%02x%02x%02x%02x", 
									m->DATA[0],
									m->DATA[1],
									m->DATA[2],
									m->DATA[3],
									m->DATA[4],
									m->DATA[5],
									m->DATA[6],
									m->DATA[7]);
    
  // print RTR, 11 or 29, CAN-Id and datalength
  asprintf(&sql, "insert into lemon values ('%03x', '%s') ", m->ID, data); 
	free(data);
}

void print_message_ex(TPCANRdMsg *mr)
{
  //printf("%u.%u ", mr->dwTime, mr->wUsec);
  print_message(&mr->Msg);
}

// lookup for HW_... constant out of device type string
int getTypeOfInterface(char *szTypeName)
{	  
	int nType = 0;
    
	if (!strcmp(szTypeName, "pci"))
		nType = HW_PCI;
	else
	{
		if (!strcmp(szTypeName, "isa"))
			nType = HW_ISA_SJA;
		else
		{
			if (!strcmp(szTypeName, "sp"))
				nType = HW_DONGLE_SJA;
			else
			{
				if (!strcmp(szTypeName, "epp"))
					nType = HW_DONGLE_SJA_EPP;
				else
				{
					if (!strcmp(szTypeName, "usb"))
						nType = HW_USB;
					else
					{
						if (!strcmp(szTypeName, "usbpro"))
							nType = HW_USB_PRO;
						else
						{
							if (!strcmp(szTypeName, "pccard"))
								nType = HW_PCCARD;
						}
					}
				}
			}
		}
	}
	
	return nType;
}

// the opposite: lookup for device string out of HW_.. constant
char *getNameOfInterface(int nType)
{
  switch (nType)
  {
    case HW_PCI:            return "pci";
    case HW_ISA_SJA:        return "isa";
    case HW_DONGLE_SJA:     return "sp";
    case HW_DONGLE_SJA_EPP: return "epp";
    case HW_USB:            return "usb";
    case HW_USB_PRO:        return "usbpro";
    case HW_PCCARD:         return "pccard";
    
    default:                return "unknown";
  }
}

// print out device and channel diagnostics
void print_diag(const char *prgName)
{
  int err;
  TPDIAG diag;
  
  err = LINUX_CAN_Statistics(h, &diag);
  if (err)
    printf("%s: can't read diagnostics, error %d!\n", prgName, err);
  else      
  {
    printf("%s: type            = %s\n",              prgName, getNameOfInterface(diag.wType));
    if ((diag.wType == HW_USB) || (diag.wType == HW_USB_PRO))
    {
      printf("             Serial Number   = 0x%08x\n", diag.dwBase);
      printf("             Device Number   = %d\n",     diag.wIrqLevel);
    }
    else
    {
      printf("             io              = 0x%08x\n", diag.dwBase);
      printf("             irq             = %d\n",     diag.wIrqLevel);
    }
    printf("             count of reads  = %d\n",     diag.dwReadCounter);
    printf("             count of writes = %d\n",     diag.dwWriteCounter);
    printf("             count of errors = %d\n",     diag.dwErrorCounter);
    printf("             count of irqs   = %d\n",     diag.dwIRQcounter);
    printf("             last CAN status = 0x%04x\n", diag.wErrorFlag);
    printf("             last error      = %d\n",     diag.nLastError);
    printf("             open paths      = %d\n",     diag.nOpenPaths);
    printf("             driver version  = %s\n",     diag.szVersionString);    
  }  
}
