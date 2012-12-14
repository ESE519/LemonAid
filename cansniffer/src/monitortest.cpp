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
bool raw_flag;
__u32 lower_ID = 0;
__u32 upper_ID = 0x1fffffff; //maximum extended can id
__u8  msgtype  = 0x02; //extended msg type

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
			char kb_char;
			char *lower = new char[4];
			char *upper = new char[4];

			if (kbhit())
			{
				kb_char = getchar();
				if(kb_char == 'c')
				{
					List.clear();
					raw_flag = false;
					errno = CAN_ResetFilter(h);
					if (errno)
					{
						perror("canmonitor: CAN_ResetFilter()");
						return errno;
					}
				}
				else if(kb_char == 'r')
				{
					raw_flag = true;
				}
				else if(kb_char.isdigit())
				{
					lower[0] = kb_char;
					lower[1] = '0';
					lower[2] = '0';
					lower[3] = '\0';
					upper[0] = kb_char + 1;
					upper[1] = '0';
					upper[2] = '0';
					upper[3] = '\0';
          lower_ID = strtoul(lower, NULL, 16);
          upper_ID = strtoul(upper, NULL, 16);
					err = CAN_MsgFilter(h, lower_ID, upper_ID, msgtype);
				}
			}	



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

						for (iter = List.begin(); iter != List.end(); iter++)
						{
							if(raw_flag)
							{
								print_message(&((*iter).Msg));
							}
							else
							{
								display_status(&((*iter).Msg));
							}
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
	raw_flag = false;
  errno = read_loop(bDisplayOn);
  if (!errno)
    return 0;

  error:
    do_exit(errno);
    return errno;
}
