package org.example.util;

import com.codingrodent.microprocessor.IBaseDevice;

public class Z80IO implements IBaseDevice {
    private int value;

    public int IORead(int address) {
        return value;
    }

    public void IOWrite(int address, int data) {
        if (data < 32)
            System.out.println();
        else
            System.out.print((char) data);
        value = data;
    }
}
