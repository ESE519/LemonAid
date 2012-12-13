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

//****************************************************************************
// DEFINES

#define DEFAULT_NODE "/dev/pcanusb0"
#ifndef bool
  #define bool  int
  #define true  1
  #define false 0
#endif

//****************************************************************************
// GLOBALS

HANDLE h;
const char *current_release;

//****************************************************************************
// CODE
// 

// what has to be done at program exit
void do_exit(int error)
{
  if (h) 
  {
    print_diag("canmonitor");
    CAN_Close(h);
  }
  printf("canmonitor: finished (%d).\n\n", error);
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
    h = CAN_Open(nType, dwPort, wIrq);
  }
  if (!h) 
    return 1;
  
  return err;
}

void generate_entry(std::list<TPCANRdMsg> List)
{
  int i;
	int16_t angel;
	int gearPos = 0,
			light = 0,
			turn = 0,
			engine = 0,
			driverDoor = 0,
			passengerDoor = 0,
			driverRear = 0,
			passengerRear = 0,
			fangle = 0,
			speed = 0,
			throttlePos = 0,
			brake = 0,
			rpm = 0;

	std::list<TPCANRdMsg>::iterator it;
	for (it = List.begin(); it != List.end(); it++)
	{
		TPCANMsg *m = &(it->Msg);

		switch (m->ID)
		{
			case 0xD0:
				printf("Gear Position: %03x ", m->ID);
				printf("%02x\n", ((m->DATA[2])>>4));
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
						break;
					case 0x66:
						printf("ENGINE ON \n");
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
				break;
			case 0x0B0:
				angel = (((m->DATA[5]) << 8) | (m->DATA[6]));
				angel = ~angel;
				fangle = (int)((double)angel / 32768.0 * 450.0);
				fangle = fangle>0 ? (fangle-450) : (fangle+450);
				fangle = fangle * 3.0;
				printf("Steering angl: %03x ", m->ID);
				printf("%d \n", fangle);
				break;
			case 0x130:
				printf("        Speed: %03x ", m->ID);
				printf("%d km/h\n", ((((m->DATA[6]) << 8)|(m->DATA[7]))/100));
				break;
			case 0x080:
				printf(" throttle pos: %03x ", m->ID);
				printf("%d percent\n", (((m->DATA[0])&0x0F)<<8 | m->DATA[1])/10 );
				break;
			case 0x252:
				printf(" brake status: %03x ", m->ID);

				printf("%d\n", (((m->DATA[1])<<8)|(m->DATA[2]))/20);
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

}

// read from CAN forever - until manual break
int read_loop(bool display_on)
{
  // read in endless loop until Ctrl-C
  while (1) 
  {
    TPCANRdMsg m;
    __u32 status;
 		if ((errno = LINUX_CAN_Read(h, &m))) 
		{
			perror("canmonitor: LINUX_CAN_Read()");
			return errno;
		}
		else 
		{
			if (m.Msg.ID == 0x0D0 || 
					m.Msg.ID >= 0x000 || // to disable the condition designed for Ford Focus
					m.Msg.ID == 0x0C8 || 
					m.Msg.ID == 0x310 || 
					m.Msg.ID == 0x340 || 
					m.Msg.ID == 0x360 || 
					m.Msg.ID == 0x0B0 || 
					m.Msg.ID == 0x130 || 
					m.Msg.ID == 0x080 || 
					m.Msg.ID == 0x252 || 
					m.Msg.ID == 0x090)
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
					if (print_period == 99)
					{
						std::list<TPCANRdMsg>::iterator iter;
						ClearScreen();
						generate_entry(List);

						for (iter = List.begin(); iter != List.end(); iter++)
						{
						//	print_message(&((*iter).Msg));
						//	display_status(&((*iter).Msg));
						}
						print_period = 0;
					}
					print_period = print_period + 1;
				}
				// check if a CAN status is pending
				if (m.Msg.MSGTYPE & MSGTYPE_STATUS) 
				{
					status = CAN_Status(h);
					if ((int)status < 0) 
					{
						errno = nGetLastError();
						perror("canmonitor: CAN_Status()");
						return errno;
					}
					else
						printf("canmonitor: pending CAN status 0x%04x read.\n", (__u16)status);
				}
			}
		}
  }

  return 0;
}

static void hlpMsg(void)
{
  printf("canmonitor - a small test program which receives and prints CAN messages.\n");
  printf("usage:   canmonitor [-f=devicenode] | [-?]\n");
  printf("options: -f - devicenode - path to devicefile, default=%s\n", DEFAULT_NODE);
  printf("         -? or --help - this help\n");
  printf("\n");
}

// here all is done
int main(int argc, char *argv[])
{
  char *ptr;
  int i;
  int nType = HW_PCI;
  __u32 dwPort = 0;
  __u16 wIrq = 0;
  __u16 wBTR0BTR1 = 0;
  int   nExtended = CAN_INIT_TYPE_ST;
  const char  *szDevNode = DEFAULT_NODE;
  bool bDevNodeGiven = false;
  bool bTypeGiven    = false;
  bool bDisplayOn    = true;
  char txt[VERSIONSTRING_LEN];

  errno = 0;

  current_release = "rttep";
  disclaimer("canmonitor");

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
      case '?':
      case 'h':
        hlpMsg();
        goto error;
        break;
      default:
        errno = EINVAL;
        perror("canmonitor: unknown command line argument!\n");
        goto error;
        break;
    }
  }
  
  // simple command input check
  if (bDevNodeGiven && bTypeGiven)
  {
    errno = EINVAL;
    perror("canmonitor: device node and type together is useless");
    goto error;
  }

  // give some information back
  if (!bTypeGiven)
  {
    printf("canmonitor: device node=\"%s\"\n", szDevNode);
  }
  else
  {
    printf("canmonitor: type=%s", getNameOfInterface(nType));
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
      printf("canmonitor: can't open %s\n", szDevNode);
      goto error;
    }
  }
  else 
  {
    h = CAN_Open(nType, dwPort, wIrq);
    if (!h)
    {
      printf("canmonitor: can't open %s device.\n", getNameOfInterface(nType));
      goto error;
    }
  }

  /* clear status */
  //  CAN_Status(h);

 // get version info
  errno = CAN_VersionInfo(h, txt);
  if (!errno)
    printf("canmonitor: driver version = %s\n", txt);
  else {
    perror("canmonitor: CAN_VersionInfo()");
    goto error;
  }

  // init to a user defined bit rate
  if (wBTR0BTR1)
  {
    errno = CAN_Init(h, wBTR0BTR1, nExtended);
    if (errno) 
    {
      perror("canmonitor: CAN_Init()");
      goto error;
    }
  }
  errno = read_loop(bDisplayOn);
  if (!errno)
    return 0;

  error:
    do_exit(errno);
    return errno;
}
