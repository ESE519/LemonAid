import serial

#from command.py import *


GET_RPM = '010C'

class OBDPort:

	#-------------------------------------------------------------
	def __init__(self, port, timeout, attempts):
		print 'in init'
		
		baud     = 38400
		databits = 8
		par      = serial.PARITY_NONE  # parity
		sb		 = 1 	#stop bits
		to 		 = timeout
		self.ELMver = "Unknown"
		self.State  = 1
	
		
		#try to open the serial connection 
		try:
			self.port = serial.Serial(port, baud, parity = par,
									  stopbits = sb, bytesize = databits,
									  timeout = to)
		except serial.SerialException:
			self.State = 0	#error in connection
			return None

			
		
		count = 0	#connection attempts
		response = ''
		while 1:
			try:
				#initialize the obd connection - command: atz
				self.send_query('atz')
			except serial.SerialException:
				self.State = 0
				return None
				
			#after sending command, get the response
			self.ELMver = self.get_response()
			print 'ELM version: ' + self.ELMver
			
			#switch off echo
			self.send_query('ate0')
			
			#get possible commands
			self.send_query('0100')
			response = self.get_response()	#get response 1
			print 'Response 1: ' + response
			
			if response == 'BUSYINIT: ...OK':
				response = self.get_response()	#get response 2
				print 'Response 2: ' + response
			else:
				#try reconnecting
				time.sleep(5)
				if count == attempts:	#reach maximum attempts
					self.close()
					self.State = 0
					return None
				count += 1
				
				
	#-------------------------------------------------------------
	def close(self):
		if self.State == 1 and (self.port != None):
			self.send_query('atz')
			self.port.close
		
		self.port = None
		self.ELMver = 'Unknown'
			
				
	
	#-------------------------------------------------------------
	def send_query(self, command_code):
		"""Internal use only"""
		if self.port:
			self.port.flushOutput()
			self.port.flushInput()
			
			for ch in command_code:
				self.port.write(ch)
				
			#now terminate the command
			self.port.write('\r\n')
			
			
	#-------------------------------------------------------------
	def get_response(self):
		"""Internal use only"""
		#introduce some delay for ECUs to respond
		time.sleep(0.2)
		if self.port:
			response_buffer = ''
			while 1:
				ch = self.port.read(1)
				if ch == '\r' and len(response_buffer) > 0:	#there is no data
					break
				else:
					#verify if there is data
					if response_buffer != '' or ch != '>':
						response_buffer = response_buffer + ch

			return response_buffer
		else:
			#no connection
			return None
			
			
	#-------------------------------------------------------------
	def get_rpm(self):
		self.send_query(GET_RPM)
		rpm = self.get_response()
		rpm = rpm.split('41 0C')[1].strip()
		rpm = rpm.replace(' ', '')
		return int(rpm, 16)/4
					
			
def main():
	obd_connection = OBDPort(port, 1000, 5)	#modify port to path of the USB device
	print obd_connection.get_rpm()
	obd_connection.close()
	
 if __name__ == '__main__':
    main()
