# optional CFLAGS include: -O -g -Wall
# -DNO_LARGE_SWITCH	compiler cannot handle really big switch statements
#			so break them into smaller pieces
# -DENDIAN_LITTLE	machine's byte-sex is like x86 instead of 68k
# -DPOSIX_TTY		use Posix termios instead of older termio (FreeBSD)
# -DMEM_BREAK		support memory-mapped I/O and breakpoints,
#				which will noticably slow down emulation

ifeq ($(OS),Windows_NT)
  EXE 		:= .exe
else
  EXE 		:=
endif

CC = gcc
CFLAGS = -g -pipe -Wall -Wextra -pedantic -ansi \
	 -D_POSIX_C_SOURCE=200809L -DPOSIX_TTY \
	 -DENDIAN_LITTLE -DMEM_BREAK
LDFLAGS = 

FILES = Makefile defs.h main.c z80.c

OBJS =	main.o \
	z80.o

all: main$(EXE)

main$(EXE): $(OBJS)
	$(CC) $(CFLAGS) $(LDFLAGS) -o main$(EXE) $(OBJS)


z80.o:		z80.c defs.h
main.o:		main.c defs.h

clean:
	rm -f main$(EXE) *.o *~

tags:	$(FILES)
	cxxtags *.[hc]

tar:
	tar -zcf main.tgz $(FILES)

files:
	@echo $(FILES)

difflist:
	@for f in $(FILES); do rcsdiff -q $$f >/dev/null || echo $$f; done
