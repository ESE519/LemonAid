INC     = -I. -I../pcandriver
FILES   = libpcan.c
DBG     = -g
RT      = NO_RT

LIBPATH = /usr/lib
INCPATH = /usr/include

LDNAME  = libpcan.so
SONAME  = $(LDNAME).0
TARGET  = $(SONAME).6

ifneq ($(RT), NO_RT)
  CFLAGS = -fPIC -shared -O2 -Wall -Wl,-soname,$(SONAME) -lc $(INC) -D$(RT) $(RT_CFLAGS) -L$(RT_LIB_DIR) -lrtdm
else
  CFLAGS = -fPIC -shared -O2 -Wall -Wl,-soname,$(SONAME) -lc $(INC) -D$(RT)
endif

all:    $(TARGET)

$(TARGET) : $(FILES)
	$(CC) $(FILES) $(CFLAGS) -o $(TARGET)
	ln -sf $(TARGET) $(LDNAME)

clean:
	rm -f *~ *.o *.so.*

install:
	cp $(TARGET) $(LIBPATH)/$(TARGET)
	ln -sf $(LIBPATH)/$(TARGET) $(LIBPATH)/$(SONAME)
	ln -sf $(LIBPATH)/$(SONAME) $(LIBPATH)/$(LDNAME)
	cp libpcan.h $(INCPATH)/libpcan.h
	chmod 644 $(INCPATH)/libpcan.h
	/sbin/ldconfig
  
uninstall:
	@-rm -f $(LIBPATH)/$(TARGET)
	@-rm -f $(LIBPATH)/$(SONAME) $(LIBPATH)/$(LDNAME)
	@-rm -f $(INCPATH)/libpcan.h
	/sbin/ldconfig
