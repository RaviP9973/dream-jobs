import Image from 'next/image'

const Agent = ( {userName, userId, type} : {userName: string, userId: string, type: string} ) => {

    const isSpeaking = true;
  return (
    // Main container for the interview view
    <div className='w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8'>
      
      {/* Interview room container */}
      <div className='w-full max-w-7xl h-full flex items-center justify-between gap-8'>
        
        {/* LEFT SIDE - AI INTERVIEWER */}
        <div className='flex-1 h-full flex items-center justify-center'>
          <div className='relative'>
            
            {/* Pinging effect rings - visible when AI is speaking */}
            {isSpeaking && (
              <>
                {/* Outer ping ring */}
                <div className='absolute inset-0 rounded-full bg-blue-500/30 animate-ping' 
                     style={{ animationDuration: '2s' }}>
                </div>
                
                {/* Middle ping ring */}
                <div className='absolute inset-0 rounded-full bg-blue-400/40 animate-ping' 
                     style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>
                </div>
                
                {/* Inner glow ring */}
                <div className='absolute inset-0 rounded-full bg-blue-300/50 animate-pulse'>
                </div>
              </>
            )}
            
            {/* AI Avatar container with border */}
            <div className={`relative z-10 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-2 ${isSpeaking ? 'ring-4 ring-blue-400 ring-offset-4 ring-offset-slate-900' : ''}`}>
              
              {/* Inner avatar circle */}
              <div className='w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden'>
                {/* Placeholder for AI avatar image */}
                <div className='text-6xl'>🤖</div>
                {/* TODO: Replace with actual AI avatar image */}
                {/* <Image src="/ai-avatar.png" alt="AI" width={256} height={256} /> */}
              </div>
            </div>
            
            {/* AI Name label */}
            <div className='mt-6 text-center'>
              <h3 className='text-2xl font-bold text-white mb-2'>AI Interviewer</h3>
              <p className='text-blue-400 text-sm'>
                {isSpeaking ? '🎤 Speaking...' : '🔇 Listening'}
              </p>
            </div>
            
            {/* Speaking indicator badge */}
            {isSpeaking && (
              <div className='absolute -top-4 -right-4 bg-green-500 rounded-full p-3 animate-bounce'>
                <span className='text-white text-xl'>💬</span>
              </div>
            )}
          </div>
        </div>
        
        {/* CENTER - VS indicator */}
        <div className='flex flex-col items-center gap-4'>
          <div className='w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center border-4 border-slate-600'>
            <span className='text-white font-bold text-xl'>VS</span>
          </div>
          {/* Connection status indicator */}
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
            <span className='text-slate-400 text-xs'>Connected</span>
          </div>
        </div>
        
        {/* RIGHT SIDE - USER/PERSON */}
        <div className='flex-1 h-full flex items-center justify-center'>
          <div className='relative'>
            
            {/* Pinging effect rings - visible when user is speaking */}
            {/* TODO: Add condition for when user is speaking */}
            {false && (
              <>
                {/* Outer ping ring */}
                <div className='absolute inset-0 rounded-full bg-green-500/30 animate-ping' 
                     style={{ animationDuration: '2s' }}>
                </div>
                
                {/* Middle ping ring */}
                <div className='absolute inset-0 rounded-full bg-green-400/40 animate-ping' 
                     style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>
                </div>
                
                {/* Inner glow ring */}
                <div className='absolute inset-0 rounded-full bg-green-300/50 animate-pulse'>
                </div>
              </>
            )}
            
            {/* User Avatar container with border */}
            <div className={`relative z-10 w-64 h-64 rounded-full bg-gradient-to-br from-green-500 to-teal-600 p-2 ${false ? 'ring-4 ring-green-400 ring-offset-4 ring-offset-slate-900' : ''}`}>
              
              {/* Inner avatar circle */}
              <div className='w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden'>
                {/* Placeholder for user avatar image */}
                <div className='text-6xl'>👤</div>
                {/* TODO: Replace with actual user avatar image or initials */}
                {/* <Image src="/user-avatar.png" alt={userName} width={256} height={256} /> */}
              </div>
            </div>
            
            {/* User Name label */}
            <div className='mt-6 text-center'>
              <h3 className='text-2xl font-bold text-white mb-2'>{userName}</h3>
              <p className='text-green-400 text-sm'>
                {/* TODO: Update condition when implementing user speaking detection */}
                {false ? '🎤 Speaking...' : '🔇 Listening'}
              </p>
            </div>
            
            {/* Speaking indicator badge */}
            {/* TODO: Show when user is speaking */}
            {false && (
              <div className='absolute -top-4 -right-4 bg-green-500 rounded-full p-3 animate-bounce'>
                <span className='text-white text-xl'>💬</span>
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Interview controls footer - TODO: Implement controls */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4'>
        {/* Microphone button */}
        <button className='w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors'>
          <span className='text-2xl'>🎤</span>
        </button>
        
        {/* Camera button */}
        <button className='w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors'>
          <span className='text-2xl'>📹</span>
        </button>
        
        {/* End call button */}
        <button className='w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors'>
          <span className='text-2xl'>📞</span>
        </button>
      </div>
      
    </div>
  )
}

export default Agent
