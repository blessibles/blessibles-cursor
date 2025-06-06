import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-start">
      {/* Hero Section */}
      <section className="w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">
          Blessibles.com
        </h1>
        <p className="text-xl md:text-2xl text-blue-700 mb-6 font-medium">
          Christian Family Printables for Every Season of Life
        </p>
        <p className="text-base md:text-lg text-blue-600 mb-8">
          Beautiful, faith-filled printables to inspire, encourage, and organize your family. 
          Trusted by Christian families everywhere.
        </p>
        <a
          href="#featured-products"
          className="inline-block bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-800 transition"
        >
          Shop Featured Printables
        </a>
      </section>

      {/* Trust Indicators */}
      <section className="w-full max-w-3xl px-4 flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
        <div className="flex flex-col items-center">
          <Image src="/icons/heart.svg" alt="Faith-Based" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">Faith-Based</span>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/icons/star.svg" alt="5-Star Reviews" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">5-Star Reviews</span>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/icons/shield.svg" alt="Secure Checkout" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">Secure Checkout</span>
        </div>
      </section>

      {/* Featured Products Placeholder */}
      <section id="featured-products" className="w-full max-w-4xl px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">
          Featured Printables
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder product cards */}
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded mb-3" />
            <h3 className="font-semibold text-blue-800 mb-1">Scripture Wall Art</h3>
            <p className="text-sm text-blue-600 mb-2">Inspire your home with beautiful verses.</p>
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">View</button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded mb-3" />
            <h3 className="font-semibold text-blue-800 mb-1">Family Prayer Journal</h3>
            <p className="text-sm text-blue-600 mb-2">Grow together in faith and gratitude.</p>
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">View</button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded mb-3" />
            <h3 className="font-semibold text-blue-800 mb-1">Kids&apos; Bible Activities</h3>
            <p className="text-sm text-blue-600 mb-2">Fun, faith-filled activities for children.</p>
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">View</button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Placeholder */}
      <section className="w-full max-w-xl px-4 mb-20 text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-2">Join Our Newsletter</h3>
        <p className="text-blue-700 mb-4">Get exclusive printables, faith tips, and special offers—straight to your inbox.</p>
        <form className="flex flex-col md:flex-row gap-2 justify-center items-center">
          <input
            type="email"
            placeholder="Your email address"
            className="px-4 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
          >
            Subscribe
          </button>
        </form>
      </section>
    </main>
  );
}
