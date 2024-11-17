#include "defs.h"
#include <signal.h>

static z80info *z80 = NULL;
int
main(int argc, const char *argv[])
{
	z80 = new_z80info();

	if (z80 == NULL)
		return -1;
	//command(z80);

	//while (1)
	{
	    printf("a%.2X f%.2X bc%.4X de%.4X hl%.4X ",
			A, F, BC, DE, HL);
        PC=0;
    	printf("ix%.4X iy%.4X sp%.4X pc%.4X:%.2X  ",
			IX, IY, SP, PC, z80->mem[PC]);
        printf("\n");
        write_mem(z80,0,6);
        write_mem(z80,1,0xff);
        write_mem(z80,2,0x76);
		z80_emulator(z80, 100000);
	    printf("a%.2X f%.2X bc%.4X de%.4X hl%.4X ",
			A, F, BC, DE, HL);
        PC=0;
    	printf("ix%.4X iy%.4X sp%.4X pc%.4X:%.2X  ",
			IX, IY, SP, PC, z80->mem[PC]);
}


}
void
haltcpu(z80info *z80) {
    	z80->halt = FALSE;
	
	/* we were interrupted by a Unix signal */
	if (z80->sig)
	{
		if (z80->sig != SIGINT)
			printf("\r\nCaught signal %d.\r\n", z80->sig);

		z80->sig = 0;
		//command(z80);
		return;
	}

	/* we are tracing execution of the z80 */
	if (z80->trace)
	{
		/* re-enable tracing */
		z80->event = TRUE;
		z80->halt = TRUE;
		//dumptrace(z80);

		if (z80->step) {}
			//command(z80);
	}

	/* a CP/M syscall - done here so tracing still works */
	if (z80->syscall)
	{
		z80->syscall = FALSE;
		//bios(z80, z80->biosfn);
	}

}
boolean
input(z80info *z80, byte haddr, byte laddr, byte *val)
{
    return 1;
}

void
output(z80info *z80, byte haddr, byte laddr, byte data)
{}
word
read_mem(z80info *z80, word addr)
{
    return z80->mem[addr];
}
void
undefinstr(z80info *z80, byte instr)
{
	printf("\r\nIllegal instruction 0x%.2X at PC=0x%.4X\r\n",
		instr, PC - 1);
	//command(z80);
}
word
write_mem(z80info *z80, word addr, byte val)
{
    return z80->mem[addr] = val;
}
