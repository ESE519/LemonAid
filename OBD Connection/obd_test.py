import serial


# define all commands 
#TODO: fill this up 
#MODE 00
GET_LIST 	= '00'

#MODE 01
GET_SPEED	= '01..'
GET_RPM		= ''

#MODE 02

#MODE 03
GET_DTC		= '03'

#MODE 04
CLEAR_DTC 	= '04'


class OBDPort:

	def init(self, port, timeout, attempts):
		print 'in init'
		
		baud     = 38400
	    databits = 8
		par      = serial.PARITY_NONE  # parity
	    sb       = 1                   # stop bits
	    to       = SERTIMEOUT
		self.ELMver = "Unknown"
	    self.State = 1 #state SERIAL is 1 connected, 0 disconnected (connection failed)
	
		
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
			
				
	
	#-------------------------------------------------------------------------------------
	def send_query(self, command_code):
		if self.port:
			self.port.flushOutput()
			self.port.flushInput()
			
			for ch in command_code:
				self.port.write(ch)
				
			#now terminate the command
			self.port.write('\r\n')
			
			
	#-------------------------------------------------------------
	def get_response(self):
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