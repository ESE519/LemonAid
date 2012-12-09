#ifndef __HELPER_H__
#define __HELPER_H__

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
#include <list>
#include <unistd.h>
#include <term.h>


std::list<TPCANRdMsg> List;
struct termios orig_termios;
int print_period;

void reset_terminal_mode();
void set_terminal_mode();
int kbhit();
int getch();
void ClearScreen();

#endif
