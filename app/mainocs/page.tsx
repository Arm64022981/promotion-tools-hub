import { Calculator, FileText, GitCompare, ArrowRight, Award, Shield, Clock } from 'lucide-react';

const tools: ToolCardProps[] = [
  {
    title: 'Promotion Data Extractor',
    titleThai: 'โปรแกรมสกัดข้อมูลโปรโมชัน',
    description: 'เครื่องมืออัตโนมัติสำหรับประมวลผลข้อมูลโปรโมชันดิบจากทีมการตลาด และจัดรูปแบบให้พร้อมใช้งานในรูปแบบตารางที่เป็นระเบียบ',
    href: '/extractor',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Prorate Calculator',
    titleThai: 'เครื่องมือคำนวณ Prorate',
    description: 'คำนวณอัตราส่วนค่าบริการหรือ Free Unit ที่เหมาะสมตามจำนวนวันที่เหลืออยู่ในรอบบิล พร้อมแสดงขั้นตอนการคำนวณอย่างละเอียด',
    href: '/prorate',
    icon: Calculator,
    color: 'emerald'
  },
  {
    title: 'File Comparator',
    titleThai: 'เครื่องมือเปรียบเทียบไฟล์',
    description: 'เปรียบเทียบความแตกต่างระหว่างข้อมูลโปรโมชันสองชุดแบบทีละบรรทัด เพื่อหาจุดที่เปลี่ยนแปลงไปอย่างรวดเร็วและแม่นยำ',
    href: '/comparator',
    icon: GitCompare,
    color: 'amber'
  },
];

type ToolCardProps = {
  title: string;
  titleThai: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: 'blue' | 'emerald' | 'amber';
};

const ToolCard = ({ title, titleThai, description, href, icon: Icon, color }: ToolCardProps) => {
  const colors = {
    blue: 'border-blue-300 hover:border-blue-600 hover:shadow-blue-200',
    emerald: 'border-emerald-300 hover:border-emerald-600 hover:shadow-emerald-200',
    amber: 'border-amber-300 hover:border-amber-600 hover:shadow-amber-200'
  };
  
  const iconColors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600'
  };
  
  return (
    <a
      href={href}
      className={`group block p-8 bg-white rounded-lg border-3 ${colors[color]} shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Icon */}
      <div className="mb-6">
        <div className={`inline-flex p-4 rounded-lg ${iconColors[color]} shadow-md`}>
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-sm font-serif font-medium text-slate-600 mb-4 italic">
        {titleThai}
      </p>
      <p className="text-slate-700 leading-relaxed mb-6 font-serif">
        {description}
      </p>
      
      {/* CTA */}
      <div className="flex items-center gap-2 text-slate-800 font-serif font-semibold border-t-2 border-slate-200 pt-4 group-hover:text-slate-900 transition-colors">
        <span>Enter Tool</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </a>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-stone-200">
      
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b-4 border-amber-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 rounded border-2 border-amber-700 shadow-lg mb-8">
            <Award className="w-5 h-5 text-white" />
            <span className="text-sm font-serif font-bold text-white uppercase tracking-wider">Professional Suite</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-wide">
            Promotion Tools Hub @ Billone
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 font-serif italic max-w-3xl mx-auto leading-relaxed">
            ศูนย์รวมเครื่องมือสำหรับการจัดการข้อมูลโปรโมชัน
            <br />
          </p>
          
          {/* Decorative Line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-1 w-24 bg-amber-500 rounded"></div>
            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
            <div className="h-1 w-24 bg-amber-500 rounded"></div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        
        {/* Tools Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-3 flex items-center justify-center gap-3">
              <div className="w-2 h-8 bg-amber-600 rounded"></div>
              Available Tools
              <div className="w-2 h-8 bg-amber-600 rounded"></div>
            </h2>
            <p className="text-lg font-serif text-slate-600 italic">
              เลือกเครื่องมือที่คุณต้องการใช้งาน
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-2xl border-4 border-slate-300 p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Time Efficient',
                titleThai: 'ประหยัดเวลา',
                description: 'ประมวลผลข้อมูลได้รวดเร็ว ลดเวลาการทำงานมากกว่า 80%'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                titleThai: 'ปลอดภัย',
                description: 'ไม่มีการเก็บข้อมูลส่วนตัว ประมวลผลบนเครื่องของคุณ'
              },
              {
                icon: Award,
                title: 'Professional Grade',
                titleThai: 'มาตรฐานสูง',
                description: 'ออกแบบมาเพื่อการใช้งานระดับองค์กรและมืออาชีพ'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center border-2 border-slate-200 rounded-lg p-6 hover:border-slate-400 hover:shadow-lg transition-all duration-300">
                  <div className="inline-flex p-4 rounded-lg bg-slate-700 shadow-md mb-4">
                    <Icon className="w-8 h-8 text-amber-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-sm font-serif font-medium text-slate-600 mb-3 italic">{feature.titleThai}</p>
                  <p className="text-slate-700 font-serif leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Tools Available', value: '3', unit: '+' },
            { label: 'Time Saved', value: '80', unit: '%' },
            { label: 'Data Accuracy', value: '99', unit: '%' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border-3 border-slate-300 rounded-lg p-8 text-center shadow-lg">
              <div className="text-5xl font-serif font-black text-slate-800 mb-2">
                {stat.value}<span className="text-amber-600">{stat.unit}</span>
              </div>
              <div className="text-sm font-serif font-semibold text-slate-600 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-700 border-t-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <div className="inline-block px-6 py-2 bg-slate-900 rounded border-2 border-amber-600">
              <p className="text-sm font-serif text-slate-300">
                © {new Date().getFullYear()} Promotion Tools Hub
              </p>
            </div>
          </div>
          <p className="text-xs font-serif text-slate-400 italic">
            Developed with Next.js & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}