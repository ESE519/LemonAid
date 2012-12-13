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
#include <ctype.h>

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

// what has to be done at program exit
void do_exit(int error)
{
  if (h) 
  {
    print_diag("cansniffer");
    CAN_Close(h);
  }
  printf("cansniffer: finished (%d).\n\n", error);
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
      perror("cansniffer: LINUX_CAN_Read()");
      return errno;
    }
    else 
    {
      if (display_on)
         print_message_ex(&m);
      // check if a CAN status is pending
      if (m.Msg.MSGTYPE & MSGTYPE_STATUS) 
      {
        status = CAN_Status(h);
        if ((int)status < 0) 
        {
          errno = nGetLastError();
          perror("cansniffer: CAN_Status()");
          return errno;
        }
        else
          printf("cansniffer: pending CAN status 0x%04x read.\n", (__u16)status);
      }
    }
  }

  return 0;
}

static void hlpMsg(void)
{
  printf("cansniffer - a program which receives and prints CAN messages.\n");
  printf("usage:   cansniffer {[-f=devicenode] | {[-p=port ]}} [-?]\n");
  printf("options: -f - devicenode - path to devicefile, default=%s\n", DEFAULT_NODE);
  printf("         -p - port in hex notation if applicable, e.g. 0x378 (default: 1st port of type).\n");
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
  disclaimer("cansniffer");

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
      case 'p':
        dwPort = strtoul(ptr, NULL, 16);
        break;
      case '?':
      case 'h':
        hlpMsg();
        goto error;
        break;
      default:
        errno = EINVAL;
        perror("cansniffer: unknown command line argument!\n");
        goto error;
        break;
    }
  }
  
  // simple command input check
  if (bDevNodeGiven && bTypeGiven)
  {
    errno = EINVAL;
    perror("cansniffer: device node and type together is useless");
    goto error;
  }

  // give some information back
  if (!bTypeGiven)
  {
    printf("cansniffer: device node=\"%s\"\n", szDevNode);
  }
  else
  {
    printf("cansniffer: type=%s", getNameOfInterface(nType));
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
      printf("cansniffer: can't open %s\n", szDevNode);
      goto error;
    }
  }
  else 
  {
    h = CAN_Open(nType, dwPort, wIrq);
    if (!h)
    {
      printf("cansniffer: can't open %s device.\n", getNameOfInterface(nType));
      goto error;
    }
  }

  /* clear status */
  //  CAN_Status(h);

 // get version info
  errno = CAN_VersionInfo(h, txt);
  if (!errno)
    printf("cansniffer: driver version = %s\n", txt);
  else {
    perror("cansniffer: CAN_VersionInfo()");
    goto error;
  }

  // init to a user defined bit rate
  if (wBTR0BTR1)
  {
    errno = CAN_Init(h, wBTR0BTR1, nExtended);
    if (errno) 
    {
      perror("cansniffer: CAN_Init()");
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
