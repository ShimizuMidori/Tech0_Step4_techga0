import Link from 'next/link';

export default function Home() {
    return (
        <div className="container mx-auto p-4 sm:p-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 text-center mb-10 sm:mb-20">Voices</h1>
            <div className="flex flex-col items-center space-y-6 sm:space-y-12">
                <button className="bg-gray-200 text-black font-bold py-4 sm:py-8 px-10 sm:px-20 rounded shadow-lg hover:bg-gray-300 transition-colors text-lg sm:text-2xl md:text-3xl w-full sm:w-2/3 lg:w-1/2">Start</button>
                <Link href="/select">
                    <button className="bg-gray-200 text-black font-bold py-4 sm:py-8 px-10 sm:px-20 rounded shadow-lg hover:bg-gray-300 transition-colors text-lg sm:text-2xl md:text-3xl w-full sm:w-2/3 lg:w-1/2">End</button>
                </Link>
                <button className="bg-gray-200 text-black font-bold py-4 sm:py-8 px-10 sm:px-20 rounded shadow-lg hover:bg-gray-300 transition-colors text-lg sm:text-2xl md:text-3xl w-full sm:w-2/3 lg:w-1/2">Breaktime</button>
                <Link href="/select">
                    <button className="bg-gray-200 text-black font-bold py-4 sm:py-8 px-10 sm:px-20 rounded shadow-lg hover:bg-gray-300 transition-colors text-lg sm:text-2xl md:text-3xl w-full sm:w-2/3 lg:w-1/2">Consulting</button>
                </Link>
                <Link href="/login">
                    <button className="bg-gray-200 text-black font-bold py-4 sm:py-8 px-10 sm:px-20 rounded shadow-lg hover:bg-gray-300 transition-colors text-lg sm:text-2xl md:text-3xl w-full sm:w-2/3 lg:w-1/2">Logout</button>
                </Link>
            </div>
        </div>
    );
}
