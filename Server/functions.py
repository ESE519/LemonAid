import serial
import time
import MySQLdb

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

                        self.cur = self.init_db()
                        
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
                time.sleep(0.5)
                if self.port:
                        response_buffer = ''
                        response_buffer = self.port.read(18)
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

        #-------------------------------------------------------------
        def init_db(self):
                self.db = MySQLdb.connect(host="localhost",  # your host, usually localhost
                     user="root",  # your username
                      passwd="12345",  # your password
                      db="mydb")  # name of the data base
                return self.db.cursor()


        #-------------------------------------------------------------
        def insert_db(self, id, speed, rpm):
                self.cur.execute("insert into speedinfo values(%s, %s, %s, now())", (id, speed, rpm))
                self.db.commit()




        #------------------------------------------------------------- RPM
        def get_rpm(self):
                pass

def main():
        obd_connection = OBDPort('/dev/tty.usbserial-AH01GB1O', 1, 5)  # modify port to path of the USB device
        temp = 1
        
        obd_connection.send_query('0104')
        print obd_connection.get_response()
        
        

if __name__ == '__main__':
        main()
