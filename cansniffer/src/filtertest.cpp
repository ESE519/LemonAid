#include <cstdio>
#include <cstdlib>
#include <cerrno>
#include <ctype.h>
#include <unistd.h>   // exit
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>    // O_RDWR

#include <src/common.h>
#include <libpcan.h>

//****************************************************************************
// DEFINES
#define DEFAULT_NODE "/dev/pcanusb0"

//****************************************************************************
// GLOBALS
HANDLE h = NULL;
const char *current_release;

//****************************************************************************
// LOCALS

//****************************************************************************
// CODE 
static void hlpMsg(void)
{
  printf("canfilter - a program to test CAN filter settings together with PCAN chardev driver.\n");
  printf("usage:   canfilter [-f=devicenode] {{[-l=low_CAN_ID] [-h=highest_CAN_ID] } | {[-c]}} [-?]\n");
  printf("options: -f - devicenode - path to devicefile, default=%s\n", DEFAULT_NODE);
  printf("         -l - lowest CAN ID to pass, e.g, '-l=0x200' (default: 0).\n");
  printf("         -u - most upper CAN ID to pass, e.g. '-u=0x201' (default: 0x7FFFFFFF).\n");
  printf("         -c - clear all filters.\n");
  printf("         -? or --help - this help\n");
  printf("\n");
}

int main(int argc, char *argv[])
{
  char *ptr;
  int  i;
  int  err;
  
  const char  *szDevNode = DEFAULT_NODE;
  __u32 lower_ID = 0;
  __u32 upper_ID = CAN_MAX_EXTENDED_ID;
  __u8  msgtype  = MSGTYPE_EXTENDED;
  bool  verbose  = false;
  bool  clear    = false;

  errno = 0;

  current_release = "rttep";
  disclaimer("canfilter");

  // decode command line arguments
  for (i = 1; i < argc; i++)
  {
    char c;

    ptr = argv[i];

    if (*ptr == '-')
    {
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
          break;
        case 'l':
          lower_ID = strtoul(ptr, NULL, 16);
          break;
        case 'u':
          upper_ID = strtoul(ptr, NULL, 16);
          break;
        case 'c':
          clear = true;
          break;
        case '?': 
        case 'h':
          hlpMsg();
          errno = 0;
          goto error;
          break;
        default:
          errno = EINVAL;
          printf("canfilter: unknown command line argument (%s)\n", ptr);
          errno = -1;
          goto error;
          break;
      }
    }
    else
    {
      printf("canfilter: unknown command line argument (%s)\n", ptr);
      errno = -1;
      goto error;
    }
  }
  
  if (verbose)
  {
    printf("canfilter: device-node = %s\n", szDevNode);
    if (clear)
      printf("canfilter: clear the filter chain.\n");
    else
    {
      printf("canfilter: lowest CAN ID to pass      = 0x%08x\n", lower_ID);
      printf("canfilter: highest CAN ID to pass     = 0x%08x\n", upper_ID);
      printf("canfilter: message type flags to pass = 0x%02x\n", msgtype);
    }    
  }
  
  // open path to device
  h = LINUX_CAN_Open(szDevNode, O_RDWR);
  
  // get driver version info
  if ((!h) && (verbose))
  {
    perror("canfilter: LINUX_CAN_Open()");
    goto error;
  }
  else
  {
    char txt[VERSIONSTRING_LEN];
    
    // clear status
    CAN_Status(h);
   
    // get version info
    errno = CAN_VersionInfo(h, txt);
    if (!errno)
      printf("canfilter: driver version = %s\n", txt);
    else
    {
      perror("canfilter: CAN_VersionInfo()");
      goto error;
    }
  }
  
  // clear or set filter criteria
  if (clear)
  {
    err = CAN_ResetFilter(h);
    if (err)
    {
      errno = err;
      perror("canfilter: CAN_ResetFilter()");
      goto error;
    }
  }
  else
  {
    err = CAN_MsgFilter(h, lower_ID, upper_ID, msgtype);
    if (err)
    {
      errno = err;
      perror("canfilter: CAN_MsgFilter()");
      goto error;
    }
  }
  
  error:
    if (h)
      CAN_Close(h);
      return errno;
}
