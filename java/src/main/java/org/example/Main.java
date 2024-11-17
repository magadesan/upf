package org.example;

import com.codingrodent.microprocessor.Z80.*;
import com.codingrodent.microprocessor.*;
import org.example.util.Z80IO;
import org.example.util.Z80Memory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {
    private static Z80Core z80;
    private static Z80Memory z80Memory;

    public static void main(String[] args) {
        byte mem[] = new byte[0x10];
        mem[0xf] = 0x76;
        z80Memory = new Z80Memory();
        for (int i = 0; i < 0x10; i++) {
            z80Memory.writeByte(i, mem[i]);
        }
        z80 = new Z80Core((IMemory) z80Memory, new Z80IO());
        z80.reset();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(System.in))) {
            System.out.println("Welcome to the Interactive CLI!");

            while (true) {
                System.out.println("exit, go, dump, pc, set, read");
                System.out.print("> ");
                String input = reader.readLine();

                if (input.equalsIgnoreCase("exit")) {
                    break;
                } else if (input.equalsIgnoreCase("go")) {
                    while (!z80.getHalt()) {
                        try {
                            z80.executeOneInstruction();
                            if (z80.blockMoveInProgress()) {
                                fail("block moves now internalized for performance - should never get here");
                            }
                        } catch (Exception e) {
                            System.out.println("Hardware crash, oops! " + e.getMessage());
                        }
                    }
                } else if (input.equalsIgnoreCase("dump")) {
                    //System.out.println("pc: "+z80.getProgramCounter());
                    z80Memory.displayRegisters(z80);
                    z80Memory.displayMemorySubset(z80.getProgramCounter(), z80.getProgramCounter() + 0x20);
                } else if (input.equalsIgnoreCase("set")) {
                    z80Memory.setMemory(reader);
                } else if (input.equalsIgnoreCase("read")) {
                    try {
                        z80Memory.readHexDumpFile(reader.readLine());
                    } catch (Exception e) {
                        System.out.println("file read error");
                    }

                } else if (input.equalsIgnoreCase("pc")) {
                    try {
                        z80.setProgramCounter(Utilities.getHexValue(reader.readLine().substring(0, 4)));
                    } catch (Exception e) {
                    }

                } else {
                    System.out.println("Unknown command: " + input);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Hello world!");
    }

    private static void fail(String s) {
        System.out.print(s);
    }
}
