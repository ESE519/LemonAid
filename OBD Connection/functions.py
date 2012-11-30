import serial
import time

class OBDPort:

        #-------------------------------------------------------------
        def __init__(self, port, timeout, attempts):
                print 'in init'

                baud = 38400
                databits = 8
                par = serial.PARITY_NONE  # parity
                sb = 1  # stop bits
                to = timeout
                self.ELMver = "Unknown"
                self.State = 1

                self.db = None
                self.cur = None
                
                print 'all init done'
                # try to open the serial connection
                try:
                        print 'trying to open port'
                        self.port = serial.Serial(port, baud, parity=par, stopbits=sb, bytesize=databits, timeout=to)
                except serial.SerialException:
                        print 'there is an exception'
                        self.State = 0  # error in connection
                        return None



                count = 0  # connection attempts
                response = ''
                while 1:
                        try:
                                # initialize the obd connection - command: atz
                                self.send_query('atz')
                        except serial.SerialException:
                                self.State = 0
                                return None


                        print self.get_response()
                        # after sending command, get the response
                        # self.ELMver = self.get_response()
                        # print 'ELM version: ' + self.ELMver
                        # print ''

                        # self.send_query('ate0');

                        #self.cur = self.init_db()
                        
                        break
                        """
                        #switch off echo
                        self.send_query('ate0')

                        #get possible commands
                        self.send_query('0100')
                        response = self.get_response()  #get response 1
                        print 'Response 1: ' + response

                        if response == 'BUSYINIT: ...OK':
                                response = self.get_response()  #get response 2
                                print 'Response 2: ' + response
                        else:
                                #try reconnecting
                                time.sleep(5)
                                if count == attempts:   #reach maximum attempts
                                        self.close()
                                        self.State = 0
                                        return None
                                count += 1
                        """


        #-------------------------------------------------------------
        def send_query(self, command_code):
                """Internal use only"""
                if self.port:
                        self.port.flushOutput()
                        self.port.flushInput()

                        for ch in command_code:
                                # print 'ch: ' + ch
                                self.port.write(ch)

                        # now terminate the command
                        self.port.write('\r\n')


        #-------------------------------------------------------------
        def get_response(self):
                """Internal use only"""
                # introduce some delay for ECUs to respond
                time.sleep(0.6)
                if self.port:
                        response_buffer = ''
                        response_buffer = self.port.read(30)
                        """
                        while 1:
                                #ch = self.port.read(18)
                                print 'ch in response: ' + ch
                                if ch == '\r' and len(response_buffer) > 0: #there is no data
                                        break
                                else:
                                        #verify if there is data
                                        if response_buffer != '' or ch != '>':
                                                response_buffer = response_buffer + ch 

                        """
                        return response_buffer
                else:
                        # no connection
                        return None




        #------------------------------------------------------------- RPM
        def get_rpm(self):
                pass

def main():
        obd_connection = OBDPort('/dev/tty.usbserial-AH01GB1O', 1, 5)  # modify port to path of the USB device
        temp = 1
        
        commands = ['0100', '0101', '0102', '0103', '0104', '0105', '0106', '0107', '0108', '0109', '010A', '010B', '010C', '010D', '010E', '010F']
        
        commands1 = ['0110', '0111', '0112', '0113', '0114', '0115', '0116', '0117', '0118', '0119', '011A', '011B', '011C', '011D', '011E', '011F']
        
        commands2 = ['0120', '0121', '0122', '0123', '0124', '0125', '0126', '0127', '0128', '0129', '012A', '012B', '012C', '012D', '012E', '012F']
        commands3 = ['0130', '0131', '0132', '0133', '0134', '0135', '0136', '0137', '0138', '0139', '013A', '013B', '013C', '013D', '013E', '013F']
        commands4 = ['0140', '0141', '0142', '0143', '0144', '0145', '0146', '0147', '0148', '0149', '014A', '014B', '014C', '014D', '014E', '014F']
        commands5 = ['0150', '0151', '0152', '0153', '0154', '0155', '0156', '0157', '0158', '0159', '015A', '015B', '015C', '015D', '015E', '015F']
        commands6 = ['0160', '0161', '0162', '0163', '0164', '0165', '0166', '0167', '0168', '0169', '016A', '016B', '016C', '016D', '016E', '016F']
        
        commands7 = ['0170', '0171', '0172', '0173', '0174', '0175', '0176', '0177', '0178', '0179', '017A', '017B', '017C', '017D', '017E', '017F']
        commands8 = ['0180', '0181', '0182', '0183', '0184', '0185', '0186', '0187', '0188', '0189', '018A', '018B', '018C', '018D', '018E', '018F']
        
        #commands9 = ['0190', '0191', '0192', '0193', '0194', '0195', '0196', '0197', '0198', '0199', '019A', '019B', '019C', '019D', '019E', '019F']
        
        DTC = ['03']
        
        mode9 = ['0901', '0902', '0904', '0906']
        
        for com in DTC:
        	obd_connection.send_query(com)	
        	print obd_connection.get_response()
        
			
		
		
if __name__ == '__main__':
        main()
