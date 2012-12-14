export CC=gcc

# MACROS AND DEFINES

define make-all
@cd pcanlib; make; cd ../cansniffer; make;
endef

define make-clean
@cd pcanlib; make clean; cd ../cansniffer; make clean;
endef

define make-install
@cd pcanlib; make install; cd ../cansniffer; make install;
endef

define make-uninstall
@cd pcanlib; make uninstall; cd ../cansniffer; make uninstall; cd ..
endef

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
