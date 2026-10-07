import { RealProject, Exam } from '../types';

export const REAL_WORLD_PROJECTS: RealProject[] = [
  {
    id: 'proj_expense_tracker',
    title: 'برنامج متتبع المصاريف والميزانية الشخصية',
    titleEn: 'Personal Expense & Budget CLI App',
    category: 'Core Python & CLI Tools',
    level: 'Beginner',
    icon: 'Wallet',
    description: 'ابنِ برنامجاً متكاملاً لإدارة المصاريف اليومية وتصنيف النفقات وحساب المتبقي من الراتب مع تقرير مالي.',
    descriptionEn: 'Build a full budgeting program to track expenses, categorize spending, and generate financial reports.',
    steps: [
      {
        id: 'step_1',
        title: 'الخطوة 1: هيكل البيانات وإضافة العمليات',
        titleEn: 'Step 1: Data Model & Transaction Logger',
        description: 'أنشئ قائمة لتخزين المصاريف مع دالة add_expense تضيف المعاملات كقواميس تضم (الوصف، المبلغ، التصنيف).',
        descriptionEn: 'Create an expenses list with an add_expense function storing dictionaries with description, amount, and category.',
        starterCode: `# الخطوة 1: تعريف القائمة والدالة
expenses = []

def add_expense(item, amount, category):
    # أضف العملية إلى قائمة expenses هنا
    expenses.append({"item": item, "amount": amount, "category": category})

add_expense("قهوة", 15, "طعام")
add_expense("بنزين", 80, "مواصلات")
print("عدد المصاريف:", len(expenses))`,
        solutionCode: `expenses = []

def add_expense(item, amount, category):
    expenses.append({"item": item, "amount": amount, "category": category})

add_expense("قهوة", 15, "طعام")
add_expense("بنزين", 80, "مواصلات")
print("عدد المصاريف:", len(expenses))`,
        expectedOutput: '2',
      },
      {
        id: 'step_2',
        title: 'الخطوة 2: حساب المجموع الإجمالي والمتبقي',
        titleEn: 'Step 2: Total Spending & Budget Left',
        description: 'اكتب دالة calculate_balance تأخذ الميزانية الكلية وتطرح منها مجموع المصاريف لتحديد الفائض أو العجز.',
        descriptionEn: 'Write a calculate_balance function deducting total expenses from a budget limit.',
        starterCode: `budget = 1000
expenses = [
    {"item": "إيجار", "amount": 600},
    {"item": "كهرباء", "amount": 150},
    {"item": "إنترنت", "amount": 100}
]

def calculate_balance(budget, expenses_list):
    total_spent = sum(e["amount"] for e in expenses_list)
    remaining = budget - total_spent
    return remaining

balance = calculate_balance(budget, expenses)
print("المتبقي من الميزانية:", balance)`,
        solutionCode: `budget = 1000
expenses = [
    {"item": "إيجار", "amount": 600},
    {"item": "كهرباء", "amount": 150},
    {"item": "إنترنت", "amount": 100}
]

def calculate_balance(budget, expenses_list):
    total_spent = sum(e["amount"] for e in expenses_list)
    remaining = budget - total_spent
    return remaining

balance = calculate_balance(budget, expenses)
print("المتبقي من الميزانية:", balance)`,
        expectedOutput: '150',
      },
      {
        id: 'step_3',
        title: 'الخطوة 3: التقرير المالي المنسق',
        titleEn: 'Step 3: Formatted Financial Report',
        description: 'اطبع تقريراً نهائياً يعرض ملخص العمليات ونسبة الاستهلاك من الميزانية.',
        descriptionEn: 'Generate a polished final report detailing spending ratio and summary.',
        starterCode: `total_budget = 500
spent = 350
ratio = (spent / total_budget) * 100

print(f"--- التقرير المالي ---")
print(f"نسبة الاستهلاك: {ratio}%")
if ratio > 80:
    print("تنبيه: اقتربت من استنفاد الميزانية!")
else:
    print("الوضع المالي ممتاز!")`,
        solutionCode: `total_budget = 500
spent = 350
ratio = (spent / total_budget) * 100

print(f"--- التقرير المالي ---")
print(f"نسبة الاستهلاك: {ratio}%")
if ratio > 80:
    print("تنبيه: اقتربت من استنفاد الميزانية!")
else:
    print("الوضع المالي ممتاز!")`,
        expectedOutput: '70',
      },
    ],
  },
  {
    id: 'proj_stock_visualizer',
    title: 'محلل اتجاهات الأسهم ومولد الرسوم البيانية',
    titleEn: 'Stock Trend Analyzer & Visualizer',
    category: 'Data Science & Matplotlib',
    level: 'Intermediate',
    icon: 'TrendingUp',
    description: 'ابنِ أداة متخصصة لحساب المتوسط المتحرك للأسعار ورسم المخططات البيانية البيعية والشراء التلقائي.',
    descriptionEn: 'Build a financial data analytics tool computing moving averages and charting price trends.',
    steps: [
      {
        id: 'step_stock_1',
        title: 'الخطوة 1: معالجة الأسعار عبر NumPy',
        titleEn: 'Step 1: NumPy Price Array & Growth',
        description: 'احسب نسبة التغير المئوي بين أول سعر وآخر سعر في جلسة التداول.',
        descriptionEn: 'Compute percentage gain between opening and closing market ticks using NumPy.',
        starterCode: `import numpy as np

prices = np.array([120, 122, 125, 128, 132, 138])
open_price = prices[0]
close_price = prices[-1]
growth_percent = ((close_price - open_price) / open_price) * 100

print("نسبة النمو:", round(growth_percent, 1))`,
        solutionCode: `import numpy as np

prices = np.array([120, 122, 125, 128, 132, 138])
open_price = prices[0]
close_price = prices[-1]
growth_percent = ((close_price - open_price) / open_price) * 100

print("نسبة النمو:", round(growth_percent, 1))`,
        expectedOutput: '15.0',
      },
      {
        id: 'step_stock_2',
        title: 'الخطوة 2: رسم مخطط الشموع والاتجاهات',
        titleEn: 'Step 2: Render Matplotlib Trend Chart',
        description: 'استخدم matplotlib لرسم منحنى حركة السعر وعرضه في نافذة الإخراج عبر plt.show().',
        descriptionEn: 'Use matplotlib to plot market prices and display via plt.show().',
        starterCode: `import matplotlib.pyplot as plt

days = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس"]
prices = [100, 105, 102, 110, 115]

plt.title("حركة السعر الأسبوعية")
plt.plot(days, prices)
plt.show()
print("تم رسم الرسم البياني المالي!")`,
        solutionCode: `import matplotlib.pyplot as plt

days = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس"]
prices = [100, 105, 102, 110, 115]

plt.title("حركة السعر الأسبوعية")
plt.plot(days, prices)
plt.show()
print("تم رسم الرسم البياني المالي!")`,
        expectedOutput: 'تم رسم الرسم البياني',
      },
    ],
  },
  {
    id: 'proj_ai_predictor',
    title: 'نموذج ذكاء اصطناعي لتوقع أسعار المنازل',
    titleEn: 'AI Real-Estate Price Prediction Model',
    category: 'Machine Learning & Scikit-Learn',
    level: 'Advanced',
    icon: 'Brain',
    description: 'ابنِ ودرب نموذج انحدار خطي (Linear Regression) للتنبؤ بأسعار المنازل بناءً على المساحة وعدد الغرف.',
    descriptionEn: 'Train a Machine Learning regression model predicting house prices based on surface area and features.',
    steps: [
      {
        id: 'step_ai_1',
        title: 'الخطوة 1: تجهيز ميزات التدريب (Features & Targets)',
        titleEn: 'Step 1: Features & Targets Matrix',
        description: 'احسب متوسط سعر المتر المربع من بيانات التدريب المتاحة.',
        descriptionEn: 'Compute average price per square meter from sample records.',
        starterCode: `areas = [100, 150, 200, 250]
prices = [200000, 300000, 400000, 500000]

# سعر المتر
meter_rates = [p / a for p, a in zip(prices, areas)]
avg_rate = sum(meter_rates) / len(meter_rates)
print("متوسط سعر المتر المربع:", avg_rate)`,
        solutionCode: `areas = [100, 150, 200, 250]
prices = [200000, 300000, 400000, 500000]

meter_rates = [p / a for p, a in zip(prices, areas)]
avg_rate = sum(meter_rates) / len(meter_rates)
print("متوسط سعر المتر المربع:", avg_rate)`,
        expectedOutput: '2000',
      },
      {
        id: 'step_ai_2',
        title: 'الخطوة 2: محاكاة معادلة التنبؤ الخطية',
        titleEn: 'Step 2: Linear Model Inference Engine',
        description: 'اكتب دالة التنبؤ y = (w * x) + b لحساب سعر منزل مساحته 180 متراً مربعاً.',
        descriptionEn: 'Implement the inference formula y = (w * x) + b to predict house price for 180 sqm.',
        starterCode: `weight = 2000 # سعر المتر
bias = 15000   # التكلفة الأساسية الثابتة

def predict_house_price(area):
    return (weight * area) + bias

predicted = predict_house_price(180)
print("السعر التقديري للمنزل:", predicted)`,
        solutionCode: `weight = 2000
bias = 15000

def predict_house_price(area):
    return (weight * area) + bias

predicted = predict_house_price(180)
print("السعر التقديري للمنزل:", predicted)`,
        expectedOutput: '375000',
      },
    ],
  },
];

export const PROCTORED_EXAMS: Exam[] = [
  {
    id: 'exam_py_core',
    trackId: 'python_basics',
    title: 'امتحان شهادة بايثون المعتمدة (Python Core Certified)',
    titleEn: 'Certified Python Core Specialist Exam',
    durationMinutes: 15,
    passingScore: 75,
    questions: [
      {
        id: 'ex_q1',
        type: 'mcq',
        title: 'المعاملات وأنواع البيانات',
        titleEn: 'Operators & Types',
        instructions: 'ما هي نتيجة تنفيذ العملية: 17 // 4 في لغة بايثون؟',
        instructionsEn: 'What is the output of 17 // 4 in Python?',
        options: ['4 (قسمة صحيحة بدون باقٍ)', '4.25', '1', '13'],
        optionsEn: ['4 (Floor division)', '4.25', '1', '13'],
        correctAnswerIndex: 0,
        xpReward: 30,
        explanation: 'المعامل // هو Floor Division الذي يحذف الكسور ويعيد الرقم الصحيح 4.',
        explanationEn: '// performs floor division returning the truncated integer 4.',
      },
      {
        id: 'ex_q2',
        type: 'mcq',
        title: 'خصائص هياكل البيانات',
        titleEn: 'Data Structures Immutability',
        instructions: 'أي من هياكل البيانات التالية في بايثون غير قابلة للتعديل (Immutable)؟',
        instructionsEn: 'Which Python collection type is strictly immutable?',
        options: ['Tuple (الأزواج المرتبة)', 'List (القوائم)', 'Dict (القواميس)', 'Set (المجموعات)'],
        optionsEn: ['Tuple', 'List', 'Dict', 'Set'],
        correctAnswerIndex: 0,
        xpReward: 30,
        explanation: 'الـ Tuple غير قابل للتعديل بعد إنشائه، بخلاف القوائم والقواميس.',
        explanationEn: 'Tuples are immutable once initialized, unlike lists and dictionaries.',
      },
      {
        id: 'ex_q3',
        type: 'code_editor',
        title: 'كتابة دالة حساب المضروب (Factorial)',
        titleEn: 'Write Factorial Function',
        instructions: 'اكتب دالة factorial(n) لحساب مضروب الرقم 4 واطبع الناتج (4! = 24).',
        instructionsEn: 'Compute the factorial of 4 (4! = 24) and print the output.',
        initialCode: `def factorial(n):
    res = 1
    for i in range(1, n + 1):
        res *= i
    return res

print(factorial(4))`,
        solutionCode: `def factorial(n):
    res = 1
    for i in range(1, n + 1):
        res *= i
    return res

print(factorial(4))`,
        testCases: [
          {
            description: 'النتيجة تساوي 24',
            descriptionEn: 'Output must be 24',
            expectedOutputSubstring: '24',
          },
        ],
        xpReward: 40,
        explanation: 'مضروب 4 هو 4*3*2*1 = 24. أداء ممتاز!',
        explanationEn: '4! = 24. Clean algorithmic implementation!',
      },
    ],
  },
  {
    id: 'exam_data_cert',
    trackId: 'data_analysis',
    title: 'امتحان شهادة محلل البيانات المحترف (Data Analyst Certified)',
    titleEn: 'Certified Data Analyst Specialist Exam',
    durationMinutes: 15,
    passingScore: 75,
    questions: [
      {
        id: 'ex_data_1',
        type: 'mcq',
        title: 'أبعاد المصفوفات في NumPy',
        titleEn: 'NumPy Array Shape',
        instructions: 'إذا كانت مصفوفة NumPy تمتلك الخاصية shape بقيمة (3, 4)، فكم عدد عناصرها الإجمالي؟',
        instructionsEn: 'If a NumPy array has shape (3, 4), what is its total elements count?',
        options: ['12 عنصراً', '7 عناصر', '3 عناصر', '4 عناصر'],
        optionsEn: ['12 elements', '7 elements', '3 elements', '4 elements'],
        correctAnswerIndex: 0,
        xpReward: 30,
        explanation: 'إجمالي العناصر هو حاصل ضرب الأبعاد: 3 * 4 = 12.',
        explanationEn: 'Total element count equals 3 * 4 = 12.',
      },
      {
        id: 'ex_data_2',
        type: 'visual_data',
        title: 'تحليل توزيع القيم والانحراف',
        titleEn: 'Analyze Distribution Spread',
        chartType: 'bar',
        chartData: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'أرباح أرباع السنة (مليون $)',
              data: [14, 22, 19, 31],
              color: '#0EA5E9',
            },
          ],
        },
        questionPrompt: 'أي ربع سنوي شهد القفزة الربحية الأكبر في المؤسسة؟',
        questionPromptEn: 'Which quarter experienced the highest profit peak?',
        options: ['Q4 (31 مليون $)', 'Q2 (22 مليون $)', 'Q3 (19 مليون $)', 'Q1 (14 مليون $)'],
        optionsEn: ['Q4 ($31M)', 'Q2 ($22M)', 'Q3 ($19M)', 'Q1 ($14M)'],
        correctAnswerIndex: 0,
        xpReward: 35,
        explanation: 'الربع الرابع Q4 حقق أعلى ربحية بـ 31 مليون دولار.',
        explanationEn: 'Q4 clearly peaked with $31M profit.',
        instructions: 'تفحص الرسم البياني الربعي وأجب بدقة:',
        instructionsEn: 'Inspect the quarterly chart and answer accurately:',
      },
    ],
  },
];
