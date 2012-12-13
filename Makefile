export CC=gcc

#****************************************************************************
# MACROS AND DEFINES

define make-all
@cd cansniffer; make;		cd ../pcanlib; make; 
endef

define make-clean
@cd cansniffer; make clean;	cd ../pcanlib; make clean;
endef

define make-install
@cd cansniffer; make install;	cd ../pcanlib; make install;
endef

define make-uninstall
@cd cansniffer; make uninstall; cd ../pcanlib; make uninstall;
endef

#****************************************************************************
# DO IT
all :
	$(make-all)

clean:
	$(make-clean)

install:
	$(make-install)
 
uninstall:
	$(make-uninstall)

# end


# DO NOT DELETE
