import logo from '../assets/images/logo.jpg';

const techStacks = [
  {
    id: 1,
    title: 'Vue.js',
    desc: 'A progressive JavaScript framework for building user interfaces.',
    image: 'https://placehold.co/350x350?text=Vue.js',
    url: 'https://vuejs.org/'
  },
  {
    id: 2,
    title: 'Cloudflare Workers',
    desc: 'A cloud platform for building fast, global, and secure applications.',
    image: 'https://placehold.co/350x350?text=Cloudflare+Workers',
    url: 'https://workers.cloudflare.com/'
  },
  {
    id: 3,
    title: 'Vike',
    desc: 'A framework for building serverless websites.',
    image: 'https://placehold.co/350x350?text=Vike',
    url: 'https://vike.dev/'
  }
];

const About = () => {
  return (
    <section className="about-page">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 id="about" className="about-title text-center text-6xl font-meletery">
          <span>- ABOUT -</span>
        </h1>

        <div className="w-full mt-10 flex flex-col md:flex-row gap-8 items-start">
          {/* left: avatar & meta */}
          <aside className="left md:w-1/3 flex flex-col items-center">
            <img 
              src={logo} 
              alt="Avatar"
              className="w-44 h-44 md:w-56 md:h-56 rounded-full object-cover shadow-xl" 
            />

            <div className="meta mt-6 w-full bg-white/5 p-4 rounded-lg text-left">
              <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div>
                  <dt className="font-semibold">NAME</dt>
                  <dd>MFJip</dd>
                </div>
                <div>
                  <dt className="font-semibold">FROM</dt>
                  <dd>Yunfu, Guangdong, China</dd>
                </div>
                <div>
                  <dt className="font-semibold">BIRTH</dt>
                  <dd>2008.06.12</dd>
                </div>
                <div>
                  <dt className="font-semibold">CONTACT</dt>
                  <dd>
                    <a className="underline" href="https://github.com/MFJip612" target="_blank" rel="noopener">Github</a>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          {/* right: intro, interests, contact */}
          <main className="right md:flex-1">
            <section className="intro mb-8">
              <h2 className="text-2xl font-meletery mb-3">Introduction</h2>
              <p className="text-lg leading-relaxed">
                A student who is insterested in website development.
              </p>
            </section>

            <section className="interests mb-8">
              <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {techStacks.map((techStack) => (
                  <article key={techStack.id} className="card bg-white/3 rounded-lg p-3 flex flex-col">
                    <img 
                      src={techStack.image} 
                      alt={techStack.title}
                      className="w-full h-40 object-cover rounded" 
                    />
                    <div className="mt-3 flex-1">
                      <h4 className="font-semibold">{techStack.title}</h4>
                      <p className="text-sm mt-2">{techStack.desc}</p>
                    </div>
                    <div className="mt-3">
                      <a 
                        href={techStack.url} 
                        target="_blank" 
                        rel="noopener"
                        className="inline-block px-3 py-1 rounded bg-primary text-sm"
                      >
                        visit »
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </section>
  );
};

export default About;