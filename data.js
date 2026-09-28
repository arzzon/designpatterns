window.DESIGN_PATTERNS = [
  {
    categoryId: 'creational',
    categoryName: 'Creational Patterns',
    categoryIcon: '🏗️',
    categoryColor: '#10b981',
    categoryDescription: 'Creational design patterns provide various object creation mechanisms, which increase flexibility and reuse of existing code. They abstract the instantiation process, making a system independent of how its objects are created, composed, and represented.\n\nWhile class-creational patterns use inheritance to vary the class that\'s instantiated, object-creational patterns will delegate instantiation to another object. These patterns become important as systems evolve to depend more on object composition than class inheritance, shifting the emphasis away from hard-coding a fixed set of behaviors toward defining a smaller set of fundamental behaviors that can be composed into any number of more complex ones.\n\nUse creational patterns when your system should be independent of how its products are created, when you want to hide the complex logic of object creation, or when you need different representations of the same object. They help control the creation process and ensure that objects are created in a manner suitable to the situation.',
    patterns: [
      {
        id: 'singleton',
        name: 'Singleton',
        icon: '🔒',
        intent: 'Ensure a class has only one instance, and provide a global point of access to it.',
        description: 'The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance. It solves the problem of needing to restrict instantiation of a class to a single object. This is useful when exactly one object is needed to coordinate actions across the system.\n\nIt allows you to access this instance from anywhere in your codebase, much like a global variable, but it protects that instance from being overwritten by other code. It also delays initialization until it\'s needed (lazy initialization).\n\nHowever, it can be considered an anti-pattern if overused, as it introduces global state into an application, which can make testing difficult and hide dependencies between classes.',
        problem: 'You need to control access to some shared resource—for example, a database or a file. You want to ensure that all parts of your code are using the same instance of the resource, avoiding redundant connections or conflicts.',
        solution: 'Make the default constructor private to prevent other objects from using the `new` operator with the Singleton class. Create a static creation method that acts as a constructor. Under the hood, this method calls the private constructor to create an object and saves it in a static field. All subsequent calls to this method return the cached object.',
        diagram: `classDiagram
    class Singleton {
        -instance Singleton$
        -Singleton()
        +getInstance() Singleton$
        +businessLogic()
    }
    Client --> Singleton`,
        applicability: [
          'When there must be exactly one instance of a class, and it must be accessible to clients from a well-known access point.',
          'When stricter control over global variables is needed.',
          'When you need to manage a connection pool or shared configuration.'
        ],
        pros: [
          'You can be sure that a class has only a single instance.',
          'You gain a global access point to that instance.',
          'The singleton object is initialized only when it\'s requested for the first time.'
        ],
        cons: [
          'Violates the Single Responsibility Principle by solving two problems at once.',
          'Can mask bad design, for instance, when the components of the program know too much about each other.',
          'Requires special treatment in a multithreaded environment so that multiple threads won\'t create a singleton object several times.'
        ],
        realWorldAnalogy: 'The government is a great analogy for Singleton. A country can have only one official government. Regardless of the personal identities of the individuals who form governments, the title, "The Government of X", is a global point of access that identifies the group of people in charge.',
        pythonCode: `class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print("Creating the database connection...")
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            # Initialize connection here
            cls._instance.connected = True
        return cls._instance

    def query(self, sql: str) -> str:
        return f"Executing {sql} on the database."

if __name__ == '__main__':
    # Client code
    db1 = DatabaseConnection()
    db2 = DatabaseConnection()
    
    print(f"db1 id: {id(db1)}")
    print(f"db2 id: {id(db2)}")
    print(f"Are they the same object? {db1 is db2}")
    print(db1.query("SELECT * FROM users"))`,
        golangCode: `package main

import (
	"fmt"
	"sync"
)

type singleton struct {
	connectionString string
}

var (
	instance *singleton
	once     sync.Once
)

func GetInstance() *singleton {
	once.Do(func() {
		fmt.Println("Creating the database connection...")
		instance = &singleton{connectionString: "postgres://localhost:5432"}
	})
	return instance
}

func (s *singleton) Query(sql string) string {
	return fmt.Sprintf("Executing '%s' on %s", sql, s.connectionString)
}

func main() {
	db1 := GetInstance()
	db2 := GetInstance()

	fmt.Printf("db1 address: %p\\n", db1)
	fmt.Printf("db2 address: %p\\n", db2)
	fmt.Printf("Are they the same? %v\\n", db1 == db2)
	fmt.Println(db1.Query("SELECT * FROM users"))
}`,
        recall: {
          emoji: '🔒',
          analogy: 'The President - there can only be one at any given time.',
          oneLiner: 'Ensures a class has only one instance and provides a global access point to it.',
          keyPoints: [
            'Private constructor prevents direct instantiation',
            'Static method controls access to the single instance',
            'Thread safety is a common challenge (use locks or built-in mechanisms)',
            'Often used for loggers, database connections, and configurations'
          ],
          whenToUse: [
            'Database connection pools',
            'Application logging service',
            'Global configuration manager'
          ],
          interviewTip: 'Mention the thread-safety challenges (double-checked locking) and how it can make unit testing difficult due to hidden global state.',
          codeHint: 'private constructor + static getInstance() that checks if instance is null'
        }
      },
      {
        id: 'factory-method',
        name: 'Factory Method',
        icon: '🏭',
        intent: 'Define an interface for creating an object, but let subclasses decide which class to instantiate.',
        description: 'The Factory Method pattern defines an interface for creating an object, but leaves the choice of its type to the subclasses, creation being deferred at run-time. It suggests that you replace direct object construction calls (using the `new` operator) with calls to a special factory method.\n\nObjects returned by a factory method are often referred to as products. At first glance, this change may look pointless: we just moved the constructor call from one part of the program to another. However, consider this: now you can override the factory method in a subclass and change the class of products being created by the method.\n\nThere\'s a slight limitation though: subclasses may return different types of products only if these products have a common base class or interface. Also, the factory method in the base class should have its return type declared as this interface.',
        problem: 'Imagine you\'re creating a logistics management application. The first version can only handle transportation by trucks, so the bulk of your code lives inside the Truck class. Later, you want to add maritime logistics, but changing the existing code to accommodate Ships would be messy and error-prone.',
        solution: 'Replace direct object construction with calls to a special factory method. Don\'t worry, the objects are still created via the `new` operator, but it\'s being called from within the factory method. Subclasses can alter the returned objects as long as they implement the common product interface.',
        diagram: `classDiagram
    class Creator {
        <<abstract>>
        +factoryMethod() Product
        +someOperation()
    }
    class ConcreteCreatorA {
        +factoryMethod() Product
    }
    class Product {
        <<interface>>
        +doStuff()
    }
    class ConcreteProductA {
        +doStuff()
    }
    Creator <|-- ConcreteCreatorA
    Product <|.. ConcreteProductA
    Creator --> Product`,
        applicability: [
          'When you don\'t know beforehand the exact types and dependencies of the objects your code should work with.',
          'When you want to provide users of your library or framework with a way to extend its internal components.',
          'When you want to save system resources by reusing existing objects instead of rebuilding them each time.'
        ],
        pros: [
          'You avoid tight coupling between the creator and the concrete products.',
          'Single Responsibility Principle. You can move the product creation code into one place.',
          'Open/Closed Principle. You can introduce new types of products without breaking existing client code.'
        ],
        cons: [
          'The code may become more complicated since you need to introduce a lot of new subclasses to implement the pattern.'
        ],
        realWorldAnalogy: 'A software company (Creator) hires programmers (Product). A GameDevCompany (ConcreteCreator) hires GameDevelopers (ConcreteProduct), while a WebDevCompany hires WebDevelopers. The base company just knows it needs programmers to do work, but leaves it to the specific branches to decide which type to hire.',
        pythonCode: `from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        pass

class EmailNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Sending Email: {message}")

class SMSNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Sending SMS: {message}")

class NotificationFactory(ABC):
    @abstractmethod
    def create_notification(self) -> Notification:
        pass
    
    def notify(self, message: str) -> None:
        notification = self.create_notification()
        notification.send(message)

class EmailFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return EmailNotification()

class SMSFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return SMSNotification()

if __name__ == '__main__':
    def client_code(factory: NotificationFactory, msg: str):
        factory.notify(msg)

    print("App: Configured for Email notifications.")
    client_code(EmailFactory(), "Hello via Email!")
    
    print("\\nApp: Configured for SMS notifications.")
    client_code(SMSFactory(), "Hello via SMS!")`,
        golangCode: `package main

import "fmt"

// Product interface
type Notification interface {
	Send(message string)
}

// Concrete Products
type EmailNotification struct{}
func (e *EmailNotification) Send(message string) {
	fmt.Printf("Sending Email: %s\\n", message)
}

type SMSNotification struct{}
func (s *SMSNotification) Send(message string) {
	fmt.Printf("Sending SMS: %s\\n", message)
}

// Creator interface
type NotificationFactory interface {
	CreateNotification() Notification
}

// Concrete Creators
type EmailFactory struct{}
func (e *EmailFactory) CreateNotification() Notification {
	return &EmailNotification{}
}

type SMSFactory struct{}
func (s *SMSFactory) CreateNotification() Notification {
	return &SMSNotification{}
}

func NotifyUser(f NotificationFactory, message string) {
	n := f.CreateNotification()
	n.Send(message)
}

func main() {
	emailFactory := &EmailFactory{}
	smsFactory := &SMSFactory{}

	NotifyUser(emailFactory, "Welcome to our service!")
	NotifyUser(smsFactory, "Your OTP is 123456")
}`,
        recall: {
          emoji: '🏭',
          analogy: 'A pizza shop where the base class handles ordering, but subclasses (NY, Chicago style) decide how to bake the pizza.',
          oneLiner: 'Delegates the instantiation of objects to subclasses.',
          keyPoints: [
            'Defines an interface for creating objects',
            'Subclasses decide which class to instantiate',
            'Promotes loose coupling by eliminating need to bind application-specific classes into the code',
            'Follows the Open/Closed Principle'
          ],
          whenToUse: [
            'Creating different types of notifications (Email, SMS, Push)',
            'Cross-platform UI components where instantiation differs by OS',
            'Plugin architectures where new types can be added later'
          ],
          interviewTip: 'Contrast it with Abstract Factory. Factory Method uses inheritance and relies on a subclass to handle the desired object instantiation. Abstract Factory uses composition.',
          codeHint: 'abstract Product createProduct();'
        }
      },
      {
        id: 'builder',
        name: 'Builder',
        icon: '🔨',
        intent: 'Separate the construction of a complex object from its representation so that the same construction process can create different representations.',
        description: 'The Builder pattern allows you to construct complex objects step by step. The pattern allows you to produce different types and representations of an object using the same construction code.\n\nInstead of having a giant constructor with many parameters (some of which might be null or have default values), the Builder pattern extracts the object construction code out of its own class and moves it to separate objects called builders. You organize this object construction into a set of steps. To create an object, you execute a series of these steps on a builder object.\n\nOptionally, you can extract a series of calls to the builder steps you use to construct a product into a separate class called Director. The Director class defines the order in which to execute the building steps, while the builder provides the implementation for those steps.',
        problem: 'Imagine a complex object that requires laborious, step-by-step initialization of many fields and nested objects. Such initialization code is usually buried inside a monstrous constructor with lots of parameters. Or worse, scattered all over the client code.',
        solution: 'Extract the object construction code out of its own class and move it to separate objects called builders. Execute creation steps on a builder object. You don\'t need to call all steps. Call only those steps that are necessary for producing a particular configuration of an object.',
        diagram: `classDiagram
    class Director {
        -builder Builder
        +construct()
    }
    class Builder {
        <<interface>>
        +buildPartA()
        +buildPartB()
        +getResult() Product
    }
    class ConcreteBuilder {
        -product Product
        +buildPartA()
        +buildPartB()
        +getResult() Product
    }
    Director o-- Builder
    Builder <|.. ConcreteBuilder`,
        applicability: [
          'To get rid of a "telescoping constructor" (a constructor with numerous parameters).',
          'When you want your code to be able to create different representations of some product.',
          'To construct Composite trees or other complex objects.'
        ],
        pros: [
          'You can construct objects step-by-step, defer construction steps or run steps recursively.',
          'You can reuse the same construction code when building various representations of products.',
          'Single Responsibility Principle. You can isolate complex construction code from the business logic of the product.'
        ],
        cons: [
          'The overall complexity of the code increases since the pattern requires creating multiple new classes.'
        ],
        realWorldAnalogy: 'Building a custom PC. You have a base setup, but you choose the CPU, RAM, GPU, and Storage step by step. The same building process (picking parts) can result in a cheap office PC or a high-end gaming rig.',
        pythonCode: `class Query:
    def __init__(self):
        self.select = "*"
        self.from_table = ""
        self.where_conditions = []
        self.limit = None

    def __str__(self):
        query = f"SELECT {self.select} FROM {self.from_table}"
        if self.where_conditions:
            query += " WHERE " + " AND ".join(self.where_conditions)
        if self.limit:
            query += f" LIMIT {self.limit}"
        return query + ";"

class QueryBuilder:
    def __init__(self):
        self.query = Query()

    def select(self, fields: str) -> 'QueryBuilder':
        self.query.select = fields
        return self

    def from_table(self, table: str) -> 'QueryBuilder':
        self.query.from_table = table
        return self

    def where(self, condition: str) -> 'QueryBuilder':
        self.query.where_conditions.append(condition)
        return self

    def limit(self, limit: int) -> 'QueryBuilder':
        self.query.limit = limit
        return self

    def build(self) -> Query:
        return self.query

if __name__ == '__main__':
    # Method chaining allows building complex queries cleanly
    sql = (QueryBuilder()
           .select("id, name, email")
           .from_table("users")
           .where("age > 18")
           .where("status = 'active'")
           .limit(10)
           .build())
           
    print("Generated SQL Query:")
    print(sql)`,
        golangCode: `package main

import (
	"fmt"
	"strings"
)

type Query struct {
	selectFields string
	fromTable    string
	where        []string
	limit        int
}

func (q *Query) String() string {
	sql := fmt.Sprintf("SELECT %s FROM %s", q.selectFields, q.fromTable)
	if len(q.where) > 0 {
		sql += " WHERE " + strings.Join(q.where, " AND ")
	}
	if q.limit > 0 {
		sql += fmt.Sprintf(" LIMIT %d", q.limit)
	}
	return sql + ";"
}

type QueryBuilder struct {
	query *Query
}

func NewQueryBuilder() *QueryBuilder {
	return &QueryBuilder{query: &Query{selectFields: "*"}}
}

func (b *QueryBuilder) Select(fields string) *QueryBuilder {
	b.query.selectFields = fields
	return b
}

func (b *QueryBuilder) From(table string) *QueryBuilder {
	b.query.fromTable = table
	return b
}

func (b *QueryBuilder) Where(condition string) *QueryBuilder {
	b.query.where = append(b.query.where, condition)
	return b
}

func (b *QueryBuilder) Limit(limit int) *QueryBuilder {
	b.query.limit = limit
	return b
}

func (b *QueryBuilder) Build() *Query {
	return b.query
}

func main() {
	builder := NewQueryBuilder()
	query := builder.Select("id, name").
		From("customers").
		Where("country = 'US'").
		Where("active = true").
		Limit(100).
		Build()

	fmt.Println("Generated SQL:")
	fmt.Println(query.String())
}`,
        recall: {
          emoji: '🔨',
          analogy: 'Ordering at Subway: You pick the bread, then meat, then veggies, step-by-step to build your sandwich.',
          oneLiner: 'Constructs complex objects step by step using method chaining.',
          keyPoints: [
            'Separates construction from representation',
            'Avoids telescoping constructors (constructors with too many parameters)',
            'Often uses a fluent interface (method chaining)',
            'Can optionally use a Director to encapsulate the assembly order'
          ],
          whenToUse: [
            'Generating SQL queries',
            'Constructing complex configuration objects',
            'Building HTTP requests or test fixtures'
          ],
          interviewTip: 'Emphasize how Builder solves the "telescoping constructor" anti-pattern and makes instantiation readable.',
          codeHint: 'Methods return `this` for chaining, with a final `build()` method.'
        }
      },
      {
        id: 'abstract-factory',
        name: 'Abstract Factory',
        icon: '🏢',
        intent: 'Provide an interface for creating families of related or dependent objects without specifying their concrete classes.',
        description: 'The Abstract Factory pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes. It encapsulates a group of individual factories that have a common theme without specifying their concrete classes.\n\nThe client software creates a concrete implementation of the abstract factory and then uses the generic interface of the factory to create the concrete objects that are part of the theme. The client doesn\'t know which concrete objects it gets from each of these internal factories, since it uses only the generic interfaces of their products.\n\nThis pattern separates the details of implementation of a set of objects from their general usage and relies on object composition, as object creation is implemented in methods exposed in the factory interface.',
        problem: 'Imagine you are creating a cross-platform UI framework. Your UI consists of buttons, checkboxes, and text fields. However, these elements must look completely different on Windows, macOS, and Linux. You need a way to ensure that you don\'t accidentally mix a Windows button with a macOS checkbox.',
        solution: 'First, explicitly declare interfaces for each distinct product of the product family (e.g., Button, Checkbox). Then, declare the Abstract Factory—an interface with a list of creation methods for all products that are part of the product family. For each variant of a product family, create a separate factory class based on the Abstract Factory interface.',
        diagram: `classDiagram
    class AbstractFactory {
        <<interface>>
        +createProductA()
        +createProductB()
    }
    class ConcreteFactory1 {
        +createProductA()
        +createProductB()
    }
    class AbstractProductA {
        <<interface>>
    }
    class AbstractProductB {
        <<interface>>
    }
    AbstractFactory <|.. ConcreteFactory1
    ConcreteFactory1 ..> AbstractProductA : creates
    ConcreteFactory1 ..> AbstractProductB : creates`,
        applicability: [
          'When your code needs to work with various families of related products, but you don\'t want it to depend on the concrete classes of those products.',
          'When you have a class with a set of Factory Methods that blur its primary responsibility.'
        ],
        pros: [
          'You can be sure that the products you\'re getting from a factory are compatible with each other.',
          'You avoid tight coupling between concrete products and client code.',
          'Single Responsibility Principle.',
          'Open/Closed Principle. You can introduce new variants of products without breaking existing code.'
        ],
        cons: [
          'The code may become more complicated than it should be, since a lot of new interfaces and classes are introduced along with the pattern.'
        ],
        realWorldAnalogy: 'A furniture shop sells families of related products: A Chair, a Sofa, and a Coffee Table. These families are available in different variants: Modern, Victorian, and Art Deco. A Modern Furniture Factory guarantees all pieces match the modern style, while a Victorian Furniture Factory produces matching classic pieces.',
        pythonCode: `from abc import ABC, abstractmethod

# Abstract Products
class Button(ABC):
    @abstractmethod
    def render(self) -> str: pass

class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str: pass

# Concrete Products - Mac
class MacButton(Button):
    def render(self) -> str: return "Mac Style Button"

class MacCheckbox(Checkbox):
    def render(self) -> str: return "Mac Style Checkbox"

# Concrete Products - Windows
class WindowsButton(Button):
    def render(self) -> str: return "Windows Style Button"

class WindowsCheckbox(Checkbox):
    def render(self) -> str: return "Windows Style Checkbox"

# Abstract Factory
class GUIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: pass
    
    @abstractmethod
    def create_checkbox(self) -> Checkbox: pass

# Concrete Factories
class MacFactory(GUIFactory):
    def create_button(self) -> Button: return MacButton()
    def create_checkbox(self) -> Checkbox: return MacCheckbox()

class WindowsFactory(GUIFactory):
    def create_button(self) -> Button: return WindowsButton()
    def create_checkbox(self) -> Checkbox: return WindowsCheckbox()

if __name__ == '__main__':
    def render_ui(factory: GUIFactory):
        button = factory.create_button()
        checkbox = factory.create_checkbox()
        print(f"Rendered: {button.render()} and {checkbox.render()}")

    print("App rendering on Mac:")
    render_ui(MacFactory())
    
    print("\\nApp rendering on Windows:")
    render_ui(WindowsFactory())`,
        golangCode: `package main

import "fmt"

// Abstract Products
type Button interface { Render() string }
type Checkbox interface { Render() string }

// Concrete Products - Mac
type MacButton struct{}
func (b *MacButton) Render() string { return "Mac Style Button" }
type MacCheckbox struct{}
func (c *MacCheckbox) Render() string { return "Mac Style Checkbox" }

// Concrete Products - Windows
type WindowsButton struct{}
func (b *WindowsButton) Render() string { return "Windows Style Button" }
type WindowsCheckbox struct{}
func (c *WindowsCheckbox) Render() string { return "Windows Style Checkbox" }

// Abstract Factory
type GUIFactory interface {
	CreateButton() Button
	CreateCheckbox() Checkbox
}

// Concrete Factories
type MacFactory struct{}
func (f *MacFactory) CreateButton() Button { return &MacButton{} }
func (f *MacFactory) CreateCheckbox() Checkbox { return &MacCheckbox{} }

type WindowsFactory struct{}
func (f *WindowsFactory) CreateButton() Button { return &WindowsButton{} }
func (f *WindowsFactory) CreateCheckbox() Checkbox { return &WindowsCheckbox{} }

func RenderUI(f GUIFactory) {
	b := f.CreateButton()
	c := f.CreateCheckbox()
	fmt.Printf("Rendered: %s and %s\\n", b.Render(), c.Render())
}

func main() {
	fmt.Println("Rendering UI on macOS:")
	RenderUI(&MacFactory{})
	
	fmt.Println("\\nRendering UI on Windows:")
	RenderUI(&WindowsFactory{})
}`,
        recall: {
          emoji: '🏢',
          analogy: 'A car factory that can produce either Sports Cars (engine, tires, seats) or SUVs (engine, tires, seats) ensuring parts aren\'t mixed.',
          oneLiner: 'Creates families of related objects without specifying their concrete classes.',
          keyPoints: [
            'Groups related Factory Methods together',
            'Ensures products from a single family are compatible',
            'Often implemented using Factory Method or Prototype internally',
            'Heavy on interfaces and classes'
          ],
          whenToUse: [
            'Cross-platform UI toolkits (Windows/Mac/Linux)',
            'Supporting multiple database engines (MySQL/Postgres) with same DAO interface',
            'Theming systems (Dark mode / Light mode components)'
          ],
          interviewTip: 'It\'s essentially a factory of factories. Use it when you need to enforce consistency across a set of related objects.',
          codeHint: 'An interface with multiple create methods, e.g., createButton(), createCheckbox()'
        }
      },
      {
        id: 'prototype',
        name: 'Prototype',
        icon: '📋',
        intent: 'Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.',
        description: 'The Prototype pattern lets you copy existing objects without making your code dependent on their classes. The pattern declares a common interface for all objects that support cloning. This interface lets you clone an object without coupling your code to the class of that object.\n\nUsually, such an interface contains just a single `clone` method. The implementation of the `clone` method is very similar in all classes. The method creates an object of the current class and carries over all of the field values of the old object into the new one.\n\nAn object that supports cloning is called a prototype. When your objects have dozens of fields and hundreds of possible configurations, cloning them might serve as an alternative to subclassing.',
        problem: 'Say you have an object, and you want to create an exact copy of it. How would you do it? First, you have to create a new object of the same class. Then you have to go through all the fields of the original object and copy their values over to the new object. Some fields might be private and not visible from outside the object itself.',
        solution: 'Delegate the cloning process to the actual objects that are being cloned. The pattern declares a common interface for all objects that support cloning. This interface lets you clone an object without coupling your code to the class of that object.',
        diagram: `classDiagram
    class Prototype {
        <<interface>>
        +clone() Prototype
    }
    class ConcretePrototype {
        -field1
        +clone() Prototype
    }
    class Client {
        +operation()
    }
    Client --> Prototype
    Prototype <|.. ConcretePrototype`,
        applicability: [
          'When your code shouldn\'t depend on the concrete classes of objects that you need to copy.',
          'When you want to reduce the number of subclasses that only differ in the way they initialize their respective objects.'
        ],
        pros: [
          'You can clone objects without coupling to their concrete classes.',
          'You can get rid of repeated initialization code in favor of cloning pre-built prototypes.',
          'You can produce complex objects more conveniently.',
          'You get an alternative to inheritance when dealing with configuration presets for complex objects.'
        ],
        cons: [
          'Cloning complex objects that have circular references might be very tricky.'
        ],
        realWorldAnalogy: 'A cell splitting in biology (mitosis). A cell makes a copy of its DNA and splits into two identical cells. The original cell is the prototype that provides the blueprint for the new cell.',
        pythonCode: `import copy

class Shape:
    def __init__(self, x: int, y: int, color: str):
        self.x = x
        self.y = y
        self.color = color

    def clone(self):
        return copy.deepcopy(self)

    def __str__(self):
        return f"{self.__class__.__name__} at ({self.x}, {self.y}) in {self.color}"

class Rectangle(Shape):
    def __init__(self, x: int, y: int, color: str, width: int, height: int):
        super().__init__(x, y, color)
        self.width = width
        self.height = height

    def __str__(self):
        return super().__str__() + f" [W:{self.width} H:{self.height}]"

if __name__ == '__main__':
    # Initialize a base object (the prototype)
    rect_prototype = Rectangle(10, 20, "red", 100, 50)
    print("Original:", rect_prototype)
    
    # Clone it to avoid setting up all fields again
    clone1 = rect_prototype.clone()
    clone1.x = 15 # Modify only what differs
    print("Clone 1:", clone1)
    
    clone2 = rect_prototype.clone()
    clone2.color = "blue"
    print("Clone 2:", clone2)`,
        golangCode: `package main

import "fmt"

type Cloneable interface {
	Clone() Cloneable
}

type File struct {
	Name string
	Size int
}

func (f *File) Clone() Cloneable {
	return &File{
		Name: f.Name + "_copy",
		Size: f.Size,
	}
}

type Folder struct {
	Name     string
	Children []Cloneable
}

func (f *Folder) Clone() Cloneable {
	clone := &Folder{Name: f.Name + "_copy"}
	var tempChildren []Cloneable
	for _, child := range f.Children {
		tempChildren = append(tempChildren, child.Clone())
	}
	clone.Children = tempChildren
	return clone
}

func main() {
	file1 := &File{Name: "document.txt", Size: 100}
	folder1 := &Folder{Name: "Documents", Children: []Cloneable{file1}}
	
	fmt.Printf("Original Folder: %s with %d child\\n", folder1.Name, len(folder1.Children))
	
	// Deep clone the folder
	folder2 := folder1.Clone().(*Folder)
	
	fmt.Printf("Cloned Folder: %s\\n", folder2.Name)
	fmt.Printf("Cloned File inside: %s\\n", folder2.Children[0].(*File).Name)
}`,
        recall: {
          emoji: '📋',
          analogy: 'Using a copy machine to duplicate a complex document instead of writing it from scratch.',
          oneLiner: 'Creates new objects by copying an existing object, known as the prototype.',
          keyPoints: [
            'Exposes a clone() method',
            'Helps avoid expensive object creation or subclassing',
            'Must carefully handle shallow vs deep copies',
            'Useful when state initialization is costly'
          ],
          whenToUse: [
            'Object cloning in graphic editors (duplicate shape)',
            'Spawning numerous identical enemies in a video game',
            'Creating templates for documents or configurations'
          ],
          interviewTip: 'Always mention the difference and trade-offs between deep copy and shallow copy when discussing Prototype.',
          codeHint: 'Implement a clone() method that copies fields (often leveraging deep copy mechanisms).'
        }
      }
    ]
  },
  {
    categoryId: 'structural',
    categoryName: 'Structural Patterns',
    categoryIcon: '🔧',
    categoryColor: '#3b82f6',
    categoryDescription: 'Structural patterns explain how to assemble objects and classes into larger structures, while keeping these structures flexible and efficient. They are concerned with how classes and objects are composed to form larger structures.\n\nStructural class patterns use inheritance to compose interfaces or implementations. As a simple example, consider how multiple inheritance mixes two or more classes into one. The result is a class that combines the properties of its base classes. This pattern is particularly useful for making independently developed class libraries work together.\n\nStructural object patterns describe ways to compose objects to realize new functionality. The added flexibility of object composition comes from the ability to change the composition at run-time, which is impossible with static class composition. They help you build complex systems from simple parts without tangling your code.',
    patterns: [
      {
        id: 'adapter',
        name: 'Adapter',
        icon: '🔌',
        intent: 'Convert the interface of a class into another interface clients expect.',
        description: 'Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate. It acts as a wrapper between two objects. It catches calls for one object and transforms them to format and interface recognizable by the second object.\n\nAdapter can not only convert data into various formats but can also help objects with different interfaces collaborate. The adapter implements the interface of one object and wraps the other one. It hides the complex conversion logic under the hood. The wrapped object doesn\'t even know about the adapter.\n\nThere are two types of adapters: Object Adapter (uses object composition) and Class Adapter (uses multiple inheritance).',
        problem: 'Imagine you are creating a stock market monitoring app. The app downloads the stock data from multiple sources in XML format and then displays nice looking charts. But the 3rd-party analytics library you want to use only accepts data in JSON format.',
        solution: 'You can create an adapter. This is a special object that converts the interface of one object so that another object can understand it. You can create an XML-to-JSON adapter for every class of the analytics library that your code works with directly. Then you adjust your code to communicate with the library only via these adapters.',
        diagram: `classDiagram
    class Target {
        <<interface>>
        +request()
    }
    class Adapter {
        -adaptee Adaptee
        +request()
    }
    class Adaptee {
        +specificRequest()
    }
    class Client {
        -target Target
    }
    Client --> Target
    Target <|.. Adapter
    Adapter --> Adaptee`,
        applicability: [
          'When you want to use some existing class, but its interface isn\'t compatible with the rest of your code.',
          'When you want to reuse several existing subclasses that lack some common functionality that can\'t be added to the superclass.'
        ],
        pros: [
          'Single Responsibility Principle. You can separate the interface or data conversion code from the primary business logic.',
          'Open/Closed Principle. You can introduce new types of adapters into the program without breaking the existing client code.'
        ],
        cons: [
          'The overall complexity of the code increases because you need to introduce a set of new interfaces and classes. Sometimes it\'s simpler to change the service class.'
        ],
        realWorldAnalogy: 'A travel power adapter. When you travel from the US to Europe, your laptop plug won\'t fit the wall socket. You use an adapter that has a US socket on one side and a European plug on the other.',
        pythonCode: `class EuropeanSocketInterface:
    def voltage(self): pass
    def live(self): pass
    def neutral(self): pass
    def earth(self): pass

# Adaptee
class EuropeanSocket(EuropeanSocketInterface):
    def voltage(self): return 230
    def live(self): return 1
    def neutral(self): return -1
    def earth(self): return 0

# Target Interface
class USASocketInterface:
    def voltage(self): pass
    def live(self): pass
    def neutral(self): pass

# Adapter
class USAdapter(USASocketInterface):
    def __init__(self, socket: EuropeanSocketInterface):
        self.socket = socket

    def voltage(self):
        # Convert voltage
        return 110

    def live(self):
        return self.socket.live()

    def neutral(self):
        return self.socket.neutral()

if __name__ == '__main__':
    # Client expects a US socket
    eu_socket = EuropeanSocket()
    adapter = USAdapter(eu_socket)
    
    print(f"Adapter provides US voltage: {adapter.voltage()}V")
    print(f"While utilizing underlying EU live pin: {adapter.live()}")`,
        golangCode: `package main

import "fmt"

// Target interface
type PaymentProcessor interface {
	Pay(amount float64)
}

// Adaptee (3rd party library)
type StripeService struct{}
func (s *StripeService) MakePayment(totalInCents int) {
	fmt.Printf("Stripe processed %d cents\\n", totalInCents)
}

// Adapter
type StripeAdapter struct {
	stripe *StripeService
}

func (a *StripeAdapter) Pay(amount float64) {
	// Convert dollars to cents to match Adaptee's expected input
	cents := int(amount * 100)
	a.stripe.MakePayment(cents)
}

func main() {
	// Client only knows about PaymentProcessor interface
	var processor PaymentProcessor = &StripeAdapter{
		stripe: &StripeService{},
	}
	
	// Client pays in dollars, Adapter converts to cents
	processor.Pay(25.50)
}`,
        recall: {
          emoji: '🔌',
          analogy: 'A power adapter that lets your US laptop plug into a European wall socket.',
          oneLiner: 'Allows objects with incompatible interfaces to work together.',
          keyPoints: [
            'Wraps an existing class with a new interface',
            'Translates requests from the target interface to the adaptee interface',
            'Often used for legacy integration or 3rd-party library wrapping',
            'Can be an Object Adapter (composition) or Class Adapter (inheritance)'
          ],
          whenToUse: [
            'Unifying interfaces of different payment gateways (Stripe, PayPal)',
            'Wrapping a legacy API with a modern interface',
            'Converting data formats between subsystems (XML to JSON)'
          ],
          interviewTip: 'Distinguish it from Decorator and Proxy. Adapter changes the interface. Decorator enhances functionality without changing the interface. Proxy provides the same interface.',
          codeHint: 'Implement target interface, hold reference to adaptee, delegate calls with necessary transformations.'
        }
      },
      {
        id: 'decorator',
        name: 'Decorator',
        icon: '🎀',
        intent: 'Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.',
        description: 'Decorator is a structural pattern that lets you attach new behaviors to objects by placing these objects inside special wrapper objects that contain the behaviors.\n\nUsing decorators you can wrap objects countless number of times since both target objects and decorators follow the same interface. The resulting object will get a stacking behavior of all wrappers. This solves the problem of "class explosion" when you have many combinations of independent features.\n\nThe Decorator pattern acts as a wrapper. It implements the same interface as the wrapped object and delegates most of the work to it. However, the wrapper can alter the result by doing something before or after delegating the work to the wrapped object.',
        problem: 'Imagine you have a Notification library that lets other programs send emails. Later you want to add SMS, Facebook, and Slack support. If you use subclasses, you end up with a massive combination of classes: `SMSAndEmailNotification`, `SlackAndSMSNotification`, etc.',
        solution: 'Use the Decorator pattern. Place the core notification logic inside a base class. Place the additional behaviors inside separate decorator classes. The client can wrap the base object into any number of decorators to get the combined behavior.',
        diagram: `classDiagram
    class Component {
        <<interface>>
        +operation()
    }
    class ConcreteComponent {
        +operation()
    }
    class Decorator {
        <<abstract>>
        -component Component
        +operation()
    }
    class ConcreteDecoratorA {
        +operation()
        +addedBehavior()
    }
    Component <|.. ConcreteComponent
    Component <|.. Decorator
    Decorator o-- Component
    Decorator <|-- ConcreteDecoratorA`,
        applicability: [
          'When you need to be able to assign extra behaviors to objects at runtime without breaking the code that uses these objects.',
          'When it\'s awkward or not possible to extend an object\'s behavior using inheritance.'
        ],
        pros: [
          'You can extend an object\'s behavior without making a new subclass.',
          'You can add or remove responsibilities from an object at runtime.',
          'You can combine several behaviors by wrapping an object into multiple decorators.',
          'Single Responsibility Principle.'
        ],
        cons: [
          'It\'s hard to remove a specific wrapper from the wrappers stack.',
          'It\'s hard to implement a decorator in such a way that its behavior doesn\'t depend on the order in the decorators stack.',
          'The initial configuration code of layers might look pretty ugly.'
        ],
        realWorldAnalogy: 'Wearing clothes. You start with a basic human (Component). When it\'s cold, you wrap them in a sweater (Decorator). If it\'s raining, you add a raincoat on top (Another Decorator). You get the combined behaviors of warmth and water resistance.',
        pythonCode: `from abc import ABC, abstractmethod

class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float: pass
    
    @abstractmethod
    def description(self) -> str: pass

class SimpleCoffee(Coffee):
    def cost(self) -> float: return 2.0
    def description(self) -> str: return "Simple Coffee"

class CoffeeDecorator(Coffee):
    def __init__(self, coffee: Coffee):
        self._coffee = coffee

    def cost(self) -> float: return self._coffee.cost()
    def description(self) -> str: return self._coffee.description()

class Milk(CoffeeDecorator):
    def cost(self) -> float: return self._coffee.cost() + 0.5
    def description(self) -> str: return self._coffee.description() + ", Milk"

class Sugar(CoffeeDecorator):
    def cost(self) -> float: return self._coffee.cost() + 0.2
    def description(self) -> str: return self._coffee.description() + ", Sugar"

if __name__ == '__main__':
    coffee = SimpleCoffee()
    print(f"{coffee.description()} : {coffee.cost()}")
    
    # Wrap with Milk and Sugar
    coffee = Milk(coffee)
    coffee = Sugar(coffee)
    
    print(f"{coffee.description()} : {coffee.cost()}")`,
        golangCode: `package main

import "fmt"

type Notifier interface {
	Send(msg string)
}

type EmailNotifier struct{}
func (e *EmailNotifier) Send(msg string) {
	fmt.Println("Sending Email:", msg)
}

// Base Decorator
type NotifierDecorator struct {
	core Notifier
}

// SMS Decorator
type SMSDecorator struct {
	NotifierDecorator
}
func (s *SMSDecorator) Send(msg string) {
	s.core.Send(msg)
	fmt.Println("Sending SMS:", msg)
}

// Slack Decorator
type SlackDecorator struct {
	NotifierDecorator
}
func (s *SlackDecorator) Send(msg string) {
	s.core.Send(msg)
	fmt.Println("Sending Slack:", msg)
}

func main() {
	// Base component
	var notifier Notifier = &EmailNotifier{}
	
	// Add SMS
	notifier = &SMSDecorator{NotifierDecorator{core: notifier}}
	
	// Add Slack
	notifier = &SlackDecorator{NotifierDecorator{core: notifier}}
	
	// Sending triggers all wrapped layers
	notifier.Send("Server is down!")
}`,
        recall: {
          emoji: '🎀',
          analogy: 'Adding toppings to a pizza. The base is pizza, but adding pepperoni or cheese wraps it with new cost and description.',
          oneLiner: 'Attaches additional responsibilities to an object dynamically.',
          keyPoints: [
            'Alternative to subclassing for extending functionality',
            'Uses object composition',
            'Decorators implement the same interface as the component they decorate',
            'Can stack multiple decorators'
          ],
          whenToUse: [
            'Adding middleware to a web request (logging, auth, compression)',
            'Adding features to a UI component (borders, scrollbars)',
            'Stacking discounts in an e-commerce checkout'
          ],
          interviewTip: 'Mention how it solves the "class explosion" problem of inheritance (combining M features doesn\'t require M^2 subclasses).',
          codeHint: 'Decorator implements Component interface AND holds a reference to a Component object.'
        }
      },
      {
        id: 'facade',
        name: 'Facade',
        icon: '🏛️',
        intent: 'Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.',
        description: 'Facade is a structural design pattern that provides a simplified interface to a library, a framework, or any other complex set of classes.\n\nA facade is a class that provides a simple interface to a complex subsystem which contains dozens of features. A facade might provide limited functionality in comparison to working with the subsystem directly. However, it includes only those features that clients really care about.\n\nHaving a facade is handy when you need to integrate your app with a sophisticated library that has dozens of features, but you just need a tiny bit of its functionality.',
        problem: 'Imagine you must make your code work with a broad set of objects that belong to a sophisticated library or framework. Ordinarily, you\'d need to initialize all of those objects, keep track of dependencies, execute methods in the correct order, and so on. The business logic of your classes would become tightly coupled to the implementation details of 3rd-party classes.',
        solution: 'A facade is a class that provides a simple interface to a complex subsystem. It delegates client requests to the appropriate objects within the subsystem. The facade manages their lifecycle and execution order.',
        diagram: `classDiagram
    class Facade {
        +operation()
    }
    class SubsystemA {
        +operationA()
    }
    class SubsystemB {
        +operationB()
    }
    class SubsystemC {
        +operationC()
    }
    Client --> Facade
    Facade --> SubsystemA
    Facade --> SubsystemB
    Facade --> SubsystemC`,
        applicability: [
          'When you need to have a limited but straightforward interface to a complex subsystem.',
          'When you want to structure a subsystem into layers.'
        ],
        pros: [
          'You can isolate your code from the complexity of a subsystem.',
          'Reduces coupling between client and subsystems.',
          'Promotes weak coupling, enabling easier refactoring of subsystems.'
        ],
        cons: [
          'A facade can become a god object coupled to all classes of an app.'
        ],
        realWorldAnalogy: 'Calling a customer service center. You call the hotline (Facade) and simply say "I want to return an item". The operator handles the complex subsystem of verifying accounts, printing labels, and notifying the warehouse.',
        pythonCode: `class Amplifier:
    def on(self): print("Amplifier on")
    def set_volume(self, level): print(f"Volume set to {level}")

class DVDPlayer:
    def on(self): print("DVD Player on")
    def play(self, movie): print(f"Playing '{movie}'")

class Projector:
    def on(self): print("Projector on")
    def set_input(self, dvd): print("Projector input set to DVD")

# Facade
class HomeTheaterFacade:
    def __init__(self):
        self.amp = Amplifier()
        self.dvd = DVDPlayer()
        self.projector = Projector()

    def watch_movie(self, movie: str):
        print("Get ready to watch a movie...")
        self.amp.on()
        self.amp.set_volume(5)
        self.projector.on()
        self.projector.set_input(self.dvd)
        self.dvd.on()
        self.dvd.play(movie)

if __name__ == '__main__':
    # Client just uses the simple Facade
    home_theater = HomeTheaterFacade()
    home_theater.watch_movie("The Matrix")`,
        golangCode: `package main

import "fmt"

type AccountCheck struct{}
func (a *AccountCheck) CheckFunds(amount int) bool {
	fmt.Println("Checking funds...")
	return true
}

type SecurityCodeCheck struct{}
func (s *SecurityCodeCheck) CheckCode(code int) bool {
	fmt.Println("Verifying security code...")
	return true
}

type Ledger struct{}
func (l *Ledger) MakeEntry(amount int) {
	fmt.Printf("Making ledger entry for $%d\\n", amount)
}

// Facade
type WalletFacade struct {
	account  *AccountCheck
	security *SecurityCodeCheck
	ledger   *Ledger
}

func NewWalletFacade() *WalletFacade {
	return &WalletFacade{
		account:  &AccountCheck{},
		security: &SecurityCodeCheck{},
		ledger:   &Ledger{},
	}
}

func (w *WalletFacade) TransferMoney(amount int, code int) {
	fmt.Println("Starting transaction...")
	if w.security.CheckCode(code) && w.account.CheckFunds(amount) {
		w.ledger.MakeEntry(amount)
		fmt.Println("Transaction successful")
	}
}

func main() {
	wallet := NewWalletFacade()
	wallet.TransferMoney(100, 1234)
}`,
        recall: {
          emoji: '🏛️',
          analogy: 'A restaurant waiter. You give a simple order to the waiter, who coordinates with the complex kitchen subsystems (chefs, prep cooks, inventory).',
          oneLiner: 'Provides a simplified interface to a complex system of classes.',
          keyPoints: [
            'Hides subsystem complexity',
            'Does not prevent clients from using subsystems directly if needed',
            'Helps decouple client code from subsystems',
            'Promotes layered architecture'
          ],
          whenToUse: [
            'Interacting with complex 3rd party APIs (e.g. Video Encoding)',
            'Simplifying a legacy system into a modern interface',
            'Hiding the bootstrapping sequence of a complex app'
          ],
          interviewTip: 'Facade provides a simplified interface, while Adapter converts an incompatible interface. Facade creates a new interface, Adapter uses an existing one.',
          codeHint: 'A class that holds references to multiple subsystem classes and orchestrates their methods in simple wrappers.'
        }
      },
      {
        id: 'proxy',
        name: 'Proxy',
        icon: '🛡️',
        intent: 'Provide a surrogate or placeholder for another object to control access to it.',
        description: 'Proxy is a structural design pattern that lets you provide a substitute or placeholder for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets through to the original object.\n\nThe Proxy pattern suggests that you create a new proxy class with the same interface as an original service object. Then you update your app so that it passes the proxy object to all of the original object\'s clients. Upon receiving a request from a client, the proxy creates a real service object and delegates all the work to it.\n\nProxies are used for lazy initialization (Virtual Proxy), access control (Protection Proxy), execution of remote code (Remote Proxy), or caching (Caching Proxy).',
        problem: 'Why would you want to control access to an object? Here is an example: you have a massive object that consumes a vast amount of system resources. You need it from time to time, but not always. You could implement lazy initialization: create this object only when it\'s actually needed. All of the object\'s clients would need to execute some delayed initialization code.',
        solution: 'The Proxy pattern suggests that you create a new proxy class with the same interface as an original service object. The proxy handles the lazy initialization, access control, logging, etc., before delegating to the real object.',
        diagram: `classDiagram
    class Subject {
        <<interface>>
        +request()
    }
    class RealSubject {
        +request()
    }
    class Proxy {
        -realSubject RealSubject
        +request()
    }
    Subject <|.. RealSubject
    Subject <|.. Proxy
    Proxy --> RealSubject`,
        applicability: [
          'Lazy initialization (virtual proxy). When you have a heavyweight service object that wastes system resources by being always up.',
          'Access control (protection proxy). When you want only specific clients to be able to use the service object.',
          'Local execution of a remote service (remote proxy). When the service object is located on a remote server.',
          'Logging requests (logging proxy). When you want to keep a history of requests to the service object.'
        ],
        pros: [
          'You can control the service object without clients knowing about it.',
          'You can manage the lifecycle of the service object when clients don\'t care about it.',
          'The proxy works even if the service object isn\'t ready or is not available.',
          'Open/Closed Principle. You can introduce new proxies without changing the service or clients.'
        ],
        cons: [
          'The code may become more complicated since you need to introduce a lot of new classes.',
          'The response from the service might get delayed.'
        ],
        realWorldAnalogy: 'A credit card is a proxy for a bank account, which is a proxy for a bundle of cash. Both implement the same interface: they can be used for making payments. A consumer feels great because they don\'t need to carry heavy cash.',
        pythonCode: `from abc import ABC, abstractmethod

class Subject(ABC):
    @abstractmethod
    def request(self) -> None: pass

class RealSubject(Subject):
    def request(self) -> None:
        print("RealSubject: Handling request.")

class Proxy(Subject):
    def __init__(self, real_subject: RealSubject):
        self._real_subject = real_subject

    def check_access(self) -> bool:
        print("Proxy: Checking access prior to firing a real request.")
        return True

    def log_access(self) -> None:
        print("Proxy: Logging the time of request.")

    def request(self) -> None:
        if self.check_access():
            self._real_subject.request()
            self.log_access()

if __name__ == '__main__':
    real_subject = RealSubject()
    proxy = Proxy(real_subject)
    
    # Client interacts with proxy using the same interface
    proxy.request()`,
        golangCode: `package main

import "fmt"

// Subject Interface
type Server interface {
	HandleRequest(url string, method string) (int, string)
}

// RealSubject
type Application struct{}
func (a *Application) HandleRequest(url, method string) (int, string) {
	if url == "/app/status" && method == "GET" {
		return 200, "Ok"
	}
	return 404, "Not Ok"
}

// Proxy
type NginxProxy struct {
	app         *Application
	rateLimiter map[string]int
}
func NewNginxProxy() *NginxProxy {
	return &NginxProxy{
		app:         &Application{},
		rateLimiter: make(map[string]int),
	}
}

func (n *NginxProxy) HandleRequest(url, method string) (int, string) {
	allowed := n.checkRateLimit(url)
	if !allowed {
		return 403, "Rate Limit Exceeded"
	}
	// Delegate to real application
	return n.app.HandleRequest(url, method)
}

func (n *NginxProxy) checkRateLimit(url string) bool {
	if n.rateLimiter[url] == 0 {
		n.rateLimiter[url] = 1
	}
	if n.rateLimiter[url] > 2 {
		return false
	}
	n.rateLimiter[url]++
	return true
}

func main() {
	nginx := NewNginxProxy()
	fmt.Println(nginx.HandleRequest("/app/status", "GET"))
	fmt.Println(nginx.HandleRequest("/app/status", "GET"))
	fmt.Println(nginx.HandleRequest("/app/status", "GET")) // Blocked
}`,
        recall: {
          emoji: '🛡️',
          analogy: 'A bouncer at a club. The bouncer (Proxy) checks ID before letting you into the club (RealSubject).',
          oneLiner: 'Controls access to an object by acting as a surrogate or placeholder.',
          keyPoints: [
            'Implements the same interface as the real subject',
            'Manages lifecycle or access to the real subject',
            'Types: Virtual (lazy init), Protection (auth), Cache, Remote',
            'Differs from Decorator in intent: Proxy controls access, Decorator adds behavior'
          ],
          whenToUse: [
            'Lazy loading heavy resources like high-res images',
            'Adding rate limiting or access control (auth middleware)',
            'Caching expensive database query results'
          ],
          interviewTip: 'Highlight the difference between Proxy and Decorator. Proxy restricts/controls access to an object, Decorator augments its behavior.',
          codeHint: 'Implements Subject interface, intercepts calls, runs proxy logic, delegates to RealSubject.'
        }
      },
      {
        id: 'composite',
        name: 'Composite',
        icon: '🌳',
        intent: 'Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.',
        description: 'Composite is a structural design pattern that lets you compose objects into tree structures and then work with these structures as if they were individual objects.\n\nThe greatest benefit of this approach is that you don\'t need to care about the concrete classes of objects that compose the tree. You don\'t need to know whether an object is a simple product or a complex box. You can treat them all the same via the common interface. When you call a method, the objects themselves pass the request down the tree.\n\nUsing the Composite pattern makes sense only when the core model of your app can be represented as a tree.',
        problem: 'Imagine you have an ordering system. Products are packed in boxes, which can contain other smaller boxes, which contain actual products. You need to calculate the total price of an order. Opening all boxes recursively in client code is messy and error-prone.',
        solution: 'The Composite pattern suggests that you work with Products and Boxes through a common interface which declares a method for calculating the total price. A Product simply returns its price. A Box iterates over its children, asks them to calculate their prices, and returns the total.',
        diagram: `classDiagram
    class Component {
        <<interface>>
        +execute()
    }
    class Leaf {
        +execute()
    }
    class Composite {
        -children List~Component~
        +add(Component)
        +remove(Component)
        +execute()
    }
    Component <|.. Leaf
    Component <|.. Composite
    Composite o-- Component`,
        applicability: [
          'When you have to implement a tree-like object structure.',
          'When you want the client code to treat both simple and complex elements uniformly.'
        ],
        pros: [
          'You can work with complex tree structures more conveniently: use polymorphism and recursion to your advantage.',
          'Open/Closed Principle. You can introduce new element types into the app without breaking the existing code, which now works with the object tree.'
        ],
        cons: [
          'It might be difficult to provide a common interface for classes whose functionality differs too much. In certain scenarios, you\'d need to overgeneralize the component interface, making it harder to comprehend.'
        ],
        realWorldAnalogy: 'An army structure. An Army contains Divisions. Divisions contain Brigades. Brigades contain Platoons, and Platoons contain individual Soldiers. When an order is given to a Division, it cascades down the tree until executed by Soldiers.',
        pythonCode: `from abc import ABC, abstractmethod

class Graphic(ABC):
    @abstractmethod
    def render(self) -> None: pass

# Leaf
class Dot(Graphic):
    def render(self) -> None:
        print("Rendering Dot")

# Leaf
class Circle(Graphic):
    def render(self) -> None:
        print("Rendering Circle")

# Composite
class CompoundGraphic(Graphic):
    def __init__(self):
        self.children = []

    def add(self, graphic: Graphic):
        self.children.append(graphic)

    def render(self) -> None:
        print("Rendering Compound Graphic...")
        for child in self.children:
            child.render()

if __name__ == '__main__':
    # Tree leaves
    dot = Dot()
    circle = Circle()
    
    # Tree composite
    compound = CompoundGraphic()
    compound.add(dot)
    compound.add(circle)
    
    # Larger composite
    root = CompoundGraphic()
    root.add(compound)
    root.add(Dot())
    
    # Client treats composites and leaves uniformly
    root.render()`,
        golangCode: `package main

import "fmt"

// Component
type FileSystemNode interface {
	Search(keyword string)
}

// Leaf
type File struct {
	name string
}
func (f *File) Search(keyword string) {
	fmt.Printf("Searching for keyword '%s' in file %s\\n", keyword, f.name)
}

// Composite
type Folder struct {
	name       string
	components []FileSystemNode
}
func (f *Folder) Add(c FileSystemNode) {
	f.components = append(f.components, c)
}
func (f *Folder) Search(keyword string) {
	fmt.Printf("Recursively searching in folder %s\\n", f.name)
	for _, composite := range f.components {
		composite.Search(keyword)
	}
}

func main() {
	file1 := &File{name: "file1.txt"}
	file2 := &File{name: "file2.txt"}
	file3 := &File{name: "file3.txt"}
	
	folder1 := &Folder{name: "Folder 1"}
	folder1.Add(file1)
	
	folder2 := &Folder{name: "Folder 2"}
	folder2.Add(file2)
	folder2.Add(file3)
	folder2.Add(folder1)
	
	// Uniformly calling search on the root composite
	folder2.Search("rose")
}`,
        recall: {
          emoji: '🌳',
          analogy: 'A file system where Folders (Composite) contain Files (Leaf) and other Folders. You can delete a file or a folder uniformly.',
          oneLiner: 'Composes objects into tree structures and lets clients treat them uniformly.',
          keyPoints: [
            'Requires a tree structure (part-whole hierarchy)',
            'Leaves and Composites implement the same interface',
            'Client code ignores the difference between compositions of objects and individual objects',
            'Operations on the Composite are typically delegated to its children recursively'
          ],
          whenToUse: [
            'UI component trees (DOM nodes, React components)',
            'File system hierarchies (files and directories)',
            'Organizational charts (managers and employees)'
          ],
          interviewTip: 'When asked about manipulating tree structures, always bring up Composite. Emphasize that it allows treating the "part" and the "whole" exactly the same.',
          codeHint: 'Composite class has a list of children of the Component interface type.'
        }
      },
      {
        id: 'bridge',
        name: 'Bridge',
        icon: '🌉',
        intent: 'Decouple an abstraction from its implementation so that the two can vary independently.',
        description: 'Bridge is a structural design pattern that lets you split a large class or a set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently of each other.\n\nThe Abstraction (also called interface) is a high-level control layer for some entity. This layer isn\'t supposed to do any real work on its own. It should delegate the work to the implementation layer (also called platform).\n\nThis pattern is often used when a class has two independent dimensions of variation (e.g., shape and color, or frontend and backend). By extracting one dimension into a separate class hierarchy, you prevent the exponential growth of classes.',
        problem: 'Say you have a geometric `Shape` class with a pair of subclasses: `Circle` and `Square`. You want to extend this class hierarchy to incorporate colors, so you create `Red` and `Blue` shape subclasses. You end up with 4 combinations. Adding another shape type and another color requires creating many more classes (M shapes * N colors = M*N subclasses).',
        solution: 'The Bridge pattern solves this by switching from inheritance to object composition. You extract one of the dimensions into a separate class hierarchy. `Shape` gets a reference field pointing to a `Color` object. Now `Shape` delegates all color-related work to the linked `Color` object.',
        diagram: `classDiagram
    class Abstraction {
        -impl Implementation
        +operation()
    }
    class RefinedAbstraction {
        +operation()
    }
    class Implementation {
        <<interface>>
        +operationImpl()
    }
    class ConcreteImplA {
        +operationImpl()
    }
    Abstraction o-- Implementation
    Abstraction <|-- RefinedAbstraction
    Implementation <|.. ConcreteImplA`,
        applicability: [
          'When you want to divide and organize a monolithic class that has several variants of some functionality (e.g., if the class can work with various database servers).',
          'When you need to extend a class in several orthogonal (independent) dimensions.',
          'If you need to be able to switch implementations at runtime.'
        ],
        pros: [
          'You can create platform-independent classes and apps.',
          'The client code works with high-level abstractions. It isn\'t exposed to the platform details.',
          'Open/Closed Principle. You can introduce new abstractions and implementations independently from each other.',
          'Single Responsibility Principle. You can focus on high-level logic in the abstraction and on platform details in the implementation.'
        ],
        cons: [
          'You might make the code more complicated by applying the pattern to a highly cohesive class.'
        ],
        realWorldAnalogy: 'A universal remote control (Abstraction) and various TVs (Implementation). The remote has standard buttons (power, volume), but the exact infrared signals sent differ depending on if it is connected to a Sony TV or a Samsung TV.',
        pythonCode: `from abc import ABC, abstractmethod

# Implementation
class Device(ABC):
    @abstractmethod
    def turn_on(self): pass
    @abstractmethod
    def turn_off(self): pass

class TV(Device):
    def turn_on(self): print("TV: Turning ON")
    def turn_off(self): print("TV: Turning OFF")

class Radio(Device):
    def turn_on(self): print("Radio: Turning ON")
    def turn_off(self): print("Radio: Turning OFF")

# Abstraction
class RemoteControl:
    def __init__(self, device: Device):
        self.device = device

    def toggle_power(self):
        print("Remote: Power toggle")
        # In reality, might check current state, just turning on here
        self.device.turn_on()

# Refined Abstraction
class AdvancedRemoteControl(RemoteControl):
    def mute(self):
        print("Remote: Mute")
        # Additional behavior without changing the Device interface

if __name__ == '__main__':
    tv = TV()
    remote = RemoteControl(tv)
    remote.toggle_power()

    radio = Radio()
    adv_remote = AdvancedRemoteControl(radio)
    adv_remote.toggle_power()
    adv_remote.mute()`,
        golangCode: `package main

import "fmt"

// Implementation
type Color interface {
	FillColor()
}

type Red struct{}
func (r *Red) FillColor() { fmt.Println("Filling with Red color") }

type Blue struct{}
func (b *Blue) FillColor() { fmt.Println("Filling with Blue color") }

// Abstraction
type Shape interface {
	Draw()
}

// Refined Abstractions
type Circle struct {
	color Color
}
func (c *Circle) Draw() {
	fmt.Print("Drawing Circle. ")
	c.color.FillColor()
}

type Square struct {
	color Color
}
func (s *Square) Draw() {
	fmt.Print("Drawing Square. ")
	s.color.FillColor()
}

func main() {
	red := &Red{}
	blue := &Blue{}

	// Combining orthogonal dimensions
	redCircle := &Circle{color: red}
	blueSquare := &Square{color: blue}

	redCircle.Draw()
	blueSquare.Draw()
}`,
        recall: {
          emoji: '🌉',
          analogy: 'A remote control (Abstraction) connected to different devices like a TV or Radio (Implementation). You can upgrade the remote without changing the TV.',
          oneLiner: 'Decouples an abstraction from its implementation so they can vary independently.',
          keyPoints: [
            'Avoids Cartesian product class explosion (M x N classes)',
            'Separates high-level logic (Abstraction) from low-level mechanics (Implementation)',
            'Uses composition over inheritance',
            'Particularly useful for cross-platform development'
          ],
          whenToUse: [
            'Cross-platform UI (Window abstraction + OS-specific drawing implementation)',
            'Shape and Color hierarchy separation',
            'Message sender abstraction (Email/SMS implementations)'
          ],
          interviewTip: 'Distinguish Bridge from Adapter: Bridge is designed up-front to let abstraction and implementation vary independently. Adapter is applied after the fact to make incompatible classes work together.',
          codeHint: 'Abstraction has a reference to Implementation interface. They evolve in separate class hierarchies.'
        }
      },
      {
        id: 'flyweight',
        name: 'Flyweight',
        icon: '🪶',
        intent: 'Use sharing to support large numbers of fine-grained objects efficiently.',
        description: 'Flyweight is a structural design pattern that lets you fit more objects into the available amount of RAM by sharing common parts of state between multiple objects instead of keeping all of the data in each object.\n\nThe pattern relies on separating the intrinsic state (shared, immutable data) from the extrinsic state (context-dependent data). Intrinsic state is stored inside the Flyweight object. Extrinsic state is passed to the Flyweight\'s methods when needed.\n\nFlyweight is primarily an optimization pattern. You should only use it when your program has memory consumption issues due to a massive number of similar objects.',
        problem: 'You are writing a video game where thousands of trees are rendered on screen. Each tree contains a mesh, a texture, and coordinates. The mesh and texture consume lots of memory and are identical for most trees. Loading thousands of identical textures causes an Out of Memory error.',
        solution: 'Extract the repeating data (mesh, texture - intrinsic state) into a separate Flyweight class. The main Tree objects now only store coordinates (extrinsic state) and a reference to a Flyweight object. You now only have a few Flyweight objects (one per tree type) shared among thousands of Tree objects.',
        diagram: `classDiagram
    class FlyweightFactory {
        -cache Map
        +getFlyweight(state)
    }
    class Flyweight {
        -intrinsicState
        +operation(extrinsicState)
    }
    class Context {
        -extrinsicState
        -flyweight Flyweight
        +operation()
    }
    Context --> Flyweight
    FlyweightFactory o-- Flyweight
    Client --> FlyweightFactory
    Client --> Context`,
        applicability: [
          'When your application needs to spawn a huge number of similar objects.',
          'When this drains all available RAM on a target device.',
          'When the objects contain duplicate states which can be extracted and shared between multiple objects.'
        ],
        pros: [
          'You can save lots of RAM, assuming your program has tons of similar objects.'
        ],
        cons: [
          'You might trade RAM over CPU cycles when some of the context data needs to be recalculated each time somebody calls a flyweight method.',
          'The code becomes much more complicated. New team members will always be wondering why the state of an entity was separated in such a way.'
        ],
        realWorldAnalogy: 'Typography in a text editor. Instead of every character "A" on the screen storing its font matrix and glyph data, it just stores its position and points to a single shared "A" glyph object.',
        pythonCode: `class TreeType:
    # Flyweight: Intrinsic State
    def __init__(self, name: str, color: str, texture: str):
        self.name = name
        self.color = color
        self.texture = texture

    def draw(self, x: int, y: int):
        print(f"Drawing {self.name} tree at ({x}, {y}) with {self.color}")

class TreeFactory:
    _tree_types = {}

    @classmethod
    def get_tree_type(cls, name: str, color: str, texture: str) -> TreeType:
        key = f"{name}_{color}_{texture}"
        if key not in cls._tree_types:
            print(f"Creating new TreeType: {name}")
            cls._tree_types[key] = TreeType(name, color, texture)
        return cls._tree_types[key]

class Tree:
    # Context: Extrinsic State + reference to Flyweight
    def __init__(self, x: int, y: int, tree_type: TreeType):
        self.x = x
        self.y = y
        self.tree_type = tree_type

    def draw(self):
        self.tree_type.draw(self.x, self.y)

if __name__ == '__main__':
    trees = []
    
    # 1000 trees but only 2 tree types are created
    type1 = TreeFactory.get_tree_type("Oak", "Green", "OakTexture")
    type2 = TreeFactory.get_tree_type("Pine", "DarkGreen", "PineTexture")
    
    trees.append(Tree(10, 20, type1))
    trees.append(Tree(50, 30, type1))
    trees.append(Tree(100, 10, type2))
    
    for t in trees:
        t.draw()`,
        golangCode: `package main

import "fmt"

// Flyweight
type PlayerDress struct {
	color string // Intrinsic
}

// Flyweight Factory
type DressFactory struct {
	dressMap map[string]*PlayerDress
}
func (d *DressFactory) GetDressByType(dressType string) *PlayerDress {
	if d.dressMap[dressType] != nil {
		return d.dressMap[dressType]
	}
	fmt.Printf("Creating new %s dress\\n", dressType)
	d.dressMap[dressType] = &PlayerDress{color: dressType}
	return d.dressMap[dressType]
}

// Context
type Player struct {
	x, y  int          // Extrinsic
	dress *PlayerDress // Flyweight ref
}
func (p *Player) Move(x, y int) {
	p.x = x
	p.y = y
	fmt.Printf("Player wearing %s moving to (%d, %d)\\n", p.dress.color, p.x, p.y)
}

func main() {
	factory := &DressFactory{dressMap: make(map[string]*PlayerDress)}
	
	// Create Terrorists (Share Red Dress)
	tDress := factory.GetDressByType("Red")
	t1 := &Player{dress: tDress}
	t2 := &Player{dress: tDress}
	
	// Create Counter-Terrorists (Share Blue Dress)
	ctDress := factory.GetDressByType("Blue")
	ct1 := &Player{dress: ctDress}
	
	t1.Move(10, 20)
	t2.Move(15, 25)
	ct1.Move(100, 200)
}`,
        recall: {
          emoji: '🪶',
          analogy: 'A public library. Instead of every citizen buying every book (huge memory), the library shares a few copies of books among many readers (Flyweight).',
          oneLiner: 'Shares objects to support large numbers of fine-grained objects efficiently.',
          keyPoints: [
            'Separates Intrinsic state (shared, immutable) from Extrinsic state (unique, passed in)',
            'Strictly a memory optimization pattern',
            'Uses a Factory to manage the pool of flyweight objects',
            'Immutable state is required for safe sharing'
          ],
          whenToUse: [
            'Rendering massive amounts of particles/trees in games',
            'Text editors storing characters (share the font glyphs, pass the position)',
            'Caching data to reduce memory footprint (interning)'
          ],
          interviewTip: 'Know the difference between Intrinsic (inside, shared, immutable) and Extrinsic (outside, unique to context) state. It is crucial for explaining Flyweight.',
          codeHint: 'FlyweightFactory maps state to instances. Context holds extrinsic state and passes it to Flyweight methods.'
        }
      }
    ]
  },
  {
    categoryId: 'behavioral',
    categoryName: 'Behavioral Patterns',
    categoryIcon: '🔄',
    categoryColor: '#8b5cf6',
    categoryDescription: 'Behavioral design patterns are concerned with algorithms and the assignment of responsibilities between objects. They describe not just patterns of objects or classes but also the patterns of communication between them. These patterns characterize complex control flow that\'s difficult to follow at run-time. They shift your focus away from flow of control to let you concentrate just on the way objects are interconnected.\n\nBehavioral class patterns use inheritance to distribute behavior between classes. Behavioral object patterns use object composition rather than inheritance. Some describe how a group of peer objects cooperate to perform a task that no single object can carry out by itself.\n\nUse behavioral patterns when you want to define how objects communicate, how state is maintained, or how algorithms are selected at runtime. They help make your system\'s behavior easier to understand and maintain by decoupling the objects that trigger operations from the objects that perform them.',
    patterns: [
      {
        id: 'observer',
        name: 'Observer',
        icon: '👁️',
        intent: 'Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.',
        description: 'Observer is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they\'re observing.\n\nThe object that has some interesting state is often called subject, but since it\'s also going to notify other objects about the changes to its state, we\'ll call it publisher. All other objects that want to track changes to the publisher\'s state are called subscribers.\n\nThe Observer pattern suggests that you add a subscription mechanism to the publisher class so individual objects can subscribe to or unsubscribe from a stream of events coming from that publisher. Whenever an important event happens to the publisher, it goes over its subscribers and calls the specific notification method on their objects.',
        problem: 'Imagine you have two types of objects: a `Customer` and a `Store`. The customer is very interested in a particular brand of product (say, a new iPhone model) which should become available in the store very soon. The customer could visit the store every day to check product availability, doing a lot of pointless trips. Or the store could send tons of spam emails to all customers each time a new product arrives.',
        solution: 'The Observer pattern solves this by introducing a subscription mechanism. Customers (Subscribers) can register with the Store (Publisher) to be notified. When the iPhone arrives, the Store iterates over its registered subscribers and calls a notification method on them.',
        diagram: `classDiagram
    class Publisher {
        -subscribers List~Subscriber~
        +subscribe(Subscriber)
        +unsubscribe(Subscriber)
        +notifySubscribers()
    }
    class Subscriber {
        <<interface>>
        +update(context)
    }
    class ConcreteSubscriberA {
        +update(context)
    }
    class ConcreteSubscriberB {
        +update(context)
    }
    Publisher o-- Subscriber
    Subscriber <|.. ConcreteSubscriberA
    Subscriber <|.. ConcreteSubscriberB`,
        applicability: [
          'When changes to the state of one object may require changing other objects, and the actual set of objects is unknown beforehand or changes dynamically.',
          'When some objects in your app must observe others, but only for a limited time or in specific cases.'
        ],
        pros: [
          'Open/Closed Principle. You can introduce new subscriber classes without having to change the publisher\'s code.',
          'You can establish relations between objects at runtime.'
        ],
        cons: [
          'Subscribers are notified in random order.',
          'Memory leaks (Lapsed listener problem) if subscribers are not unsubscribed properly.'
        ],
        realWorldAnalogy: 'Subscribing to a newsletter. Instead of visiting a blog every day to check for new articles, you give them your email. When a new article is published, the system sends an email to all registered subscribers.',
        pythonCode: `from abc import ABC, abstractmethod

class Subscriber(ABC):
    @abstractmethod
    def update(self, message: str) -> None: pass

class Publisher:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, subscriber: Subscriber) -> None:
        self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber: Subscriber) -> None:
        self._subscribers.remove(subscriber)

    def notify_subscribers(self, message: str) -> None:
        for subscriber in self._subscribers:
            subscriber.update(message)

class EmailSubscriber(Subscriber):
    def update(self, message: str) -> None:
        print(f"Email sent: {message}")

class SMSSubscriber(Subscriber):
    def update(self, message: str) -> None:
        print(f"SMS sent: {message}")

if __name__ == '__main__':
    store = Publisher()
    
    email_sub = EmailSubscriber()
    sms_sub = SMSSubscriber()
    
    store.subscribe(email_sub)
    store.subscribe(sms_sub)
    
    print("New iPhone arrived!")
    store.notify_subscribers("iPhone 15 is now in stock!")`,
        golangCode: `package main

import "fmt"

// Subscriber interface
type Observer interface {
	Update(string)
}

// Publisher
type Item struct {
	observerList []Observer
	name         string
	inStock      bool
}
func NewItem(name string) *Item {
	return &Item{name: name}
}
func (i *Item) UpdateAvailability() {
	i.inStock = true
	i.NotifyAll()
}
func (i *Item) Register(o Observer) {
	i.observerList = append(i.observerList, o)
}
func (i *Item) NotifyAll() {
	for _, observer := range i.observerList {
		observer.Update(i.name)
	}
}

// Concrete Subscriber
type Customer struct {
	id string
}
func (c *Customer) Update(itemName string) {
	fmt.Printf("Alert to customer %s: %s is now in stock\\n", c.id, itemName)
}

func main() {
	shirt := NewItem("Nike Shirt")
	
	cust1 := &Customer{id: "abc@gmail.com"}
	cust2 := &Customer{id: "xyz@gmail.com"}
	
	shirt.Register(cust1)
	shirt.Register(cust2)
	
	shirt.UpdateAvailability()
}`,
        recall: {
          emoji: '👁️',
          analogy: 'Following someone on Twitter. When they tweet, all their followers see it on their timeline.',
          oneLiner: 'Defines a one-to-many dependency so that when one object changes state, dependents are notified.',
          keyPoints: [
            'Implements a publish-subscribe mechanism',
            'Publisher holds a list of subscribers',
            'Subscribers implement a common interface (e.g., update())',
            'Decouples the sender of the event from the receivers'
          ],
          whenToUse: [
            'Event-driven systems (DOM event listeners)',
            'Implementing pub/sub queues or message brokers',
            'MVC architecture (View observes Model)'
          ],
          interviewTip: 'Mention the "Lapsed Listener Problem" where forgetting to unsubscribe causes memory leaks, as the publisher holds strong references to subscribers.',
          codeHint: 'List of subscribers. subscribe(), unsubscribe(), notify() methods in Publisher.'
        }
      },
      {
        id: 'strategy',
        name: 'Strategy',
        icon: '🎯',
        intent: 'Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.',
        description: 'Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.\n\nThe Strategy pattern suggests that you take a class that does something specific in a lot of different ways and extract all of these algorithms into separate classes called strategies. The original class, called context, must have a field for storing a reference to one of the strategies. The context delegates the work to a linked strategy object instead of executing it on its own.\n\nThe context isn\'t responsible for selecting an appropriate algorithm for the job. Instead, the client passes the desired strategy to the context. In fact, the context doesn\'t know much about strategies. It works with all strategies through the same generic interface.',
        problem: 'Imagine you are creating a navigation app. Initially it only builds routes for cars. Later you add walking routes, then public transport, then cycling. The main `Navigator` class grows massive with complex `if/else` logic selecting the route-building algorithm.',
        solution: 'Extract the routing algorithms into separate classes implementing a common `RouteStrategy` interface. The `Navigator` context just holds a reference to a strategy and calls `buildRoute()`. The client chooses which strategy to pass to the navigator.',
        diagram: `classDiagram
    class Context {
        -strategy Strategy
        +setStrategy(Strategy)
        +executeStrategy()
    }
    class Strategy {
        <<interface>>
        +execute()
    }
    class ConcreteStrategyA {
        +execute()
    }
    class ConcreteStrategyB {
        +execute()
    }
    Context o-- Strategy
    Strategy <|.. ConcreteStrategyA
    Strategy <|.. ConcreteStrategyB`,
        applicability: [
          'When you want to use different variants of an algorithm within an object and be able to switch from one algorithm to another during runtime.',
          'When you have a lot of similar classes that only differ in the way they execute some behavior.',
          'To isolate the business logic of a class from the implementation details of algorithms that may not be that important in the context of that logic.',
          'When your class has a massive conditional operator that switches between different variants of the same algorithm.'
        ],
        pros: [
          'You can swap algorithms used inside an object at runtime.',
          'You can isolate the implementation details of an algorithm from the code that uses it.',
          'You can replace inheritance with composition.',
          'Open/Closed Principle. You can introduce new strategies without having to change the context.'
        ],
        cons: [
          'If you only have a couple of algorithms and they rarely change, there\'s no real reason to overcomplicate the program with new classes and interfaces that come along with the pattern.',
          'Clients must be aware of the differences between strategies to be able to select a proper one.'
        ],
        realWorldAnalogy: 'Going to the airport. You can choose a strategy: drive your car, take a taxi, or ride the bus. The route is the same, but the algorithm (strategy) for getting there varies in cost, time, and convenience.',
        pythonCode: `from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: float) -> None: pass

class CreditCardPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Paid {amount} USD using Credit Card")

class PayPalPayment(PaymentStrategy):
    def pay(self, amount: float) -> None:
        print(f"Paid {amount} USD using PayPal")

class ShoppingCart:
    def __init__(self):
        self.amount = 0

    def set_amount(self, amount: float):
        self.amount = amount

    # Context accepts a strategy and delegates to it
    def checkout(self, payment_method: PaymentStrategy):
        payment_method.pay(self.amount)

if __name__ == '__main__':
    cart = ShoppingCart()
    cart.set_amount(100.50)
    
    # Client selects strategy at runtime
    cart.checkout(PayPalPayment())
    
    # Swap strategy easily
    cart.checkout(CreditCardPayment())`,
        golangCode: `package main

import "fmt"

// Strategy Interface
type SortStrategy interface {
	Sort([]int)
}

// Concrete Strategies
type BubbleSort struct{}
func (s *BubbleSort) Sort(a []int) {
	fmt.Println("Sorting using Bubble Sort")
}

type QuickSort struct{}
func (s *QuickSort) Sort(a []int) {
	fmt.Println("Sorting using Quick Sort")
}

// Context
type Sorter struct {
	strategy SortStrategy
}

func (s *Sorter) SetStrategy(strategy SortStrategy) {
	s.strategy = strategy
}

func (s *Sorter) Sort(a []int) {
	s.strategy.Sort(a)
}

func main() {
	data := []int{1, 5, 3, 2, 8}
	
	sorter := &Sorter{}
	
	// Use QuickSort
	sorter.SetStrategy(&QuickSort{})
	sorter.Sort(data)
	
	// Switch to BubbleSort at runtime
	sorter.SetStrategy(&BubbleSort{})
	sorter.Sort(data)
}`,
        recall: {
          emoji: '🎯',
          analogy: 'Changing tools on a drill. The drill (Context) does the spinning, but the drill bit (Strategy) determines what kind of hole is made.',
          oneLiner: 'Encapsulates algorithms in separate classes and makes them interchangeable at runtime.',
          keyPoints: [
            'Replaces massive switch statements for algorithms',
            'Context holds a reference to a Strategy interface',
            'Client code is responsible for supplying the concrete Strategy',
            'Favor composition over inheritance'
          ],
          whenToUse: [
            'Payment processing (Credit Card, PayPal, Crypto)',
            'Sorting algorithms (QuickSort for large sets, InsertionSort for small)',
            'File compression (ZIP, RAR, TAR)'
          ],
          interviewTip: 'Compare Strategy with State. State changes the behavior internally based on state transitions, while Strategy changes behavior externally because the client sets the specific strategy.',
          codeHint: 'Context class holds an interface reference. Client calls setStrategy(new ConcreteStrategy()) then execute().'
        }
      },
      {
        id: 'command',
        name: 'Command',
        icon: '📜',
        intent: 'Encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.',
        description: 'Command is a behavioral design pattern that turns a request into a stand-alone object that contains all information about the request. This transformation lets you pass requests as a method arguments, delay or queue a request\'s execution, and support undoable operations.\n\nGood software design is often based on the principle of separation of concerns. The Command pattern separates the object that invokes the operation (Invoker) from the object that actually performs the operation (Receiver). The Command object sits between them and encapsulates the call.\n\nThe command object contains all the details needed to execute the request, including the receiver object, method name, and arguments. This means the invoker just calls a single `execute()` method without knowing the details.',
        problem: 'Imagine you are building a text editor toolbar. You create a base `Button` class. You create subclasses like `CopyButton`, `PasteButton`, `UndoButton`. You end up with lots of subclasses. Also, the same operations (like copy) can be triggered from shortcuts, menus, or context menus. You don\'t want to duplicate the logic.',
        solution: 'Extract the request details into a Command object. Buttons, menus, and shortcuts (Invokers) simply hold a reference to a Command object and call `execute()`. The Command handles the actual logic or delegates it to the text editor model (Receiver).',
        diagram: `classDiagram
    class Invoker {
        -command Command
        +setCommand(Command)
        +executeCommand()
    }
    class Command {
        <<interface>>
        +execute()
    }
    class ConcreteCommand {
        -receiver Receiver
        +execute()
    }
    class Receiver {
        +action()
    }
    Invoker o-- Command
    Command <|.. ConcreteCommand
    ConcreteCommand --> Receiver`,
        applicability: [
          'When you want to parameterize objects with operations.',
          'When you want to queue operations, schedule their execution, or execute them remotely.',
          'When you want to implement reversible operations (undo/redo).'
        ],
        pros: [
          'Single Responsibility Principle. You can decouple classes that invoke operations from classes that perform these operations.',
          'Open/Closed Principle. You can introduce new commands into the app without breaking existing client code.',
          'You can implement undo/redo.',
          'You can implement deferred execution of operations.',
          'You can assemble a set of simple commands into a complex one.'
        ],
        cons: [
          'The code may become more complicated since you\'re introducing a whole new layer between senders and receivers.'
        ],
        realWorldAnalogy: 'Ordering food at a restaurant. You give an order (Command) to the waiter (Invoker). The order gets written on paper and put in a queue. The chef (Receiver) takes the order and executes it. The waiter doesn\'t know how to cook, just how to pass the command.',
        pythonCode: `from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None: pass

# Receiver
class Light:
    def turn_on(self): print("Light is ON")
    def turn_off(self): print("Light is OFF")

# Concrete Commands
class TurnOnCommand(Command):
    def __init__(self, light: Light):
        self.light = light
    def execute(self) -> None:
        self.light.turn_on()

class TurnOffCommand(Command):
    def __init__(self, light: Light):
        self.light = light
    def execute(self) -> None:
        self.light.turn_off()

# Invoker
class RemoteControl:
    def __init__(self):
        self.command = None
        
    def set_command(self, command: Command):
        self.command = command
        
    def press_button(self):
        if self.command:
            self.command.execute()

if __name__ == '__main__':
    light = Light()
    remote = RemoteControl()
    
    # Configure remote to turn on the light
    remote.set_command(TurnOnCommand(light))
    remote.press_button()
    
    # Configure remote to turn off the light
    remote.set_command(TurnOffCommand(light))
    remote.press_button()`,
        golangCode: `package main

import "fmt"

// Command Interface
type Command interface {
	Execute()
}

// Receiver
type TV struct{}
func (t *TV) On() { fmt.Println("TV is ON") }
func (t *TV) Off() { fmt.Println("TV is OFF") }

// Concrete Commands
type OnCommand struct {
	device *TV
}
func (c *OnCommand) Execute() {
	c.device.On()
}

type OffCommand struct {
	device *TV
}
func (c *OffCommand) Execute() {
	c.device.Off()
}

// Invoker
type Button struct {
	command Command
}
func (b *Button) Press() {
	b.command.Execute()
}

func main() {
	tv := &TV{}
	onCommand := &OnCommand{device: tv}
	offCommand := &OffCommand{device: tv}
	
	onButton := &Button{command: onCommand}
	onButton.Press()
	
	offButton := &Button{command: offCommand}
	offButton.Press()
}`,
        recall: {
          emoji: '📜',
          analogy: 'A restaurant order slip. The waiter takes the slip (Command) to the kitchen, and the chef (Receiver) cooks it. The waiter doesn\'t cook, just passes the command.',
          oneLiner: 'Turns a request into a stand-alone object, enabling undo/redo and task queueing.',
          keyPoints: [
            'Decouples Invoker (sender) from Receiver (doer)',
            'Commands can be serialized and queued',
            'Essential for implementing Undo/Redo functionality (by adding an unexecute() method)',
            'Often used with macros (Composite Command)'
          ],
          whenToUse: [
            'GUI buttons and menu items',
            'Undo/Redo stacks in text editors or graphic editors',
            'Job queues or thread pools executing background tasks'
          ],
          interviewTip: 'If asked how to implement Undo functionality in an app, Command pattern is always the correct answer. You store an array of executed commands and call undo() on them.',
          codeHint: 'Invoker -> calls command.execute() -> Command calls receiver.action()'
        }
      },
      {
        id: 'iterator',
        name: 'Iterator',
        icon: '🔄',
        intent: 'Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.',
        description: 'Iterator is a behavioral design pattern that lets you traverse elements of a collection without exposing its underlying representation (list, stack, tree, etc.).\n\nThe main idea of the Iterator pattern is to extract the traversal behavior of a collection into a separate object called an iterator. In addition to implementing the algorithm itself, an iterator object encapsulates all of the traversal details, such as the current position and how many elements are left till the end.\n\nBecause of this, several iterators can go through the same collection at the same time, independently of each other.',
        problem: 'Collections can be stored in lists, trees, graphs, or hash maps. To access elements, the collection must expose its inner structure, violating encapsulation. Also, implementing traversal algorithms for all these structures inside the client code is messy.',
        solution: 'Extract the traversal behavior into a separate Iterator object. The collection (Iterable) provides a method that returns an Iterator. The client uses the Iterator interface (`next()`, `hasNext()`) to traverse elements without knowing if they are in a list or tree.',
        diagram: `classDiagram
    class IterableCollection {
        <<interface>>
        +createIterator() Iterator
    }
    class ConcreteCollection {
        +createIterator() Iterator
    }
    class Iterator {
        <<interface>>
        +getNext()
        +hasMore() bool
    }
    class ConcreteIterator {
        -collection ConcreteCollection
        +getNext()
        +hasMore() bool
    }
    IterableCollection <|.. ConcreteCollection
    Iterator <|.. ConcreteIterator
    ConcreteCollection ..> ConcreteIterator : creates`,
        applicability: [
          'When your collection has a complex data structure under the hood, but you want to hide its complexity from clients.',
          'To reduce duplication of the traversal code across your app.',
          'When you want your code to be able to traverse different data structures or when types of these structures are unknown beforehand.'
        ],
        pros: [
          'Single Responsibility Principle. You can clean up the client code and the collections by extracting bulky traversal algorithms into separate classes.',
          'Open/Closed Principle. You can implement new types of collections and iterators and pass them to existing code without breaking anything.',
          'You can iterate over the same collection in parallel because each iterator object contains its own iteration state.',
          'For the same reason, you can delay an iteration and continue it when needed.'
        ],
        cons: [
          'Applying the pattern can be an overkill if your app only works with simple collections.',
          'Using an iterator may be less efficient than going through elements of some specialized collections directly.'
        ],
        realWorldAnalogy: 'A TV remote control. You don\'t need to know how the TV stores its channels (list, frequency map). You just press the "Next" and "Previous" buttons (Iterator) to traverse through them.',
        pythonCode: `from collections.abc import Iterator, Iterable

class AlphabeticalIterator(Iterator):
    def __init__(self, collection, reverse: bool = False):
        self._collection = collection
        self._reverse = reverse
        self._position = -1 if reverse else 0

    def __next__(self):
        try:
            value = self._collection[self._position]
            self._position += -1 if self._reverse else 1
        except IndexError:
            raise StopIteration()
        return value

class WordsCollection(Iterable):
    def __init__(self):
        self._words = []

    def add_word(self, word: str):
        self._words.append(word)

    def __iter__(self) -> AlphabeticalIterator:
        return AlphabeticalIterator(self._words)

    def get_reverse_iterator(self) -> AlphabeticalIterator:
        return AlphabeticalIterator(self._words, True)

if __name__ == '__main__':
    collection = WordsCollection()
    collection.add_word("First")
    collection.add_word("Second")
    collection.add_word("Third")

    print("Straight traversal:")
    for word in collection:
        print(word)

    print("\\nReverse traversal:")
    for word in collection.get_reverse_iterator():
        print(word)`,
        golangCode: `package main

import "fmt"

// Iterator Interface
type Iterator interface {
	HasNext() bool
	GetNext() *User
}

// Collection Interface
type Collection interface {
	CreateIterator() Iterator
}

// User struct
type User struct {
	name string
	age  int
}

// Concrete Collection
type UserCollection struct {
	users []*User
}
func (u *UserCollection) CreateIterator() Iterator {
	return &UserIterator{
		users: u.users,
	}
}

// Concrete Iterator
type UserIterator struct {
	index int
	users []*User
}
func (u *UserIterator) HasNext() bool {
	if u.index < len(u.users) {
		return true
	}
	return false
}
func (u *UserIterator) GetNext() *User {
	if u.HasNext() {
		user := u.users[u.index]
		u.index++
		return user
	}
	return nil
}

func main() {
	user1 := &User{name: "a", age: 30}
	user2 := &User{name: "b", age: 20}
	
	collection := &UserCollection{
		users: []*User{user1, user2},
	}
	
	iterator := collection.CreateIterator()
	
	for iterator.HasNext() {
		user := iterator.GetNext()
		fmt.Printf("User is %+v\\n", user)
	}
}`,
        recall: {
          emoji: '🔄',
          analogy: 'A bookmark in a book. The bookmark remembers what page you are on (state) so you can read the next page without the book needing to remember for you.',
          oneLiner: 'Lets you traverse elements of a collection without exposing its underlying representation.',
          keyPoints: [
            'Hides collection internals (list, tree, graph)',
            'Standardizes traversal (hasNext, next)',
            'Allows multiple independent traversals simultaneously',
            'Built into most modern languages (foreach loops)'
          ],
          whenToUse: [
            'Traversing complex data structures like Trees or Graphs',
            'Providing custom traversal logic (e.g., iterating a list backwards, or only even elements)',
            'When you want polymorphic iteration across different data structures'
          ],
          interviewTip: 'Mention that while Iterator is a classic GoF pattern, most modern languages (Python, Java, Go) have it baked into their core syntax via `yield`, `Iterable` interfaces, and `for-range` loops.',
          codeHint: 'Collection returns an Iterator. Iterator has `hasNext()` and `next()`.'
        }
      },
      {
        id: 'state',
        name: 'State',
        icon: '🚦',
        intent: 'Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.',
        description: 'State is a behavioral design pattern that lets an object alter its behavior when its internal state changes. It appears as if the object changed its class.\n\nThe State pattern is closely related to the concept of a Finite-State Machine. The main idea is that, at any given moment, there\'s a finite number of states which a program can be in. Within any unique state, the program behaves differently, and the program can be switched from one state to another instantaneously. However, depending on a current state, the program may or may not switch to certain other states.\n\nThe State pattern suggests that you create new classes for all possible states of an object and extract all state-specific behaviors into these classes.',
        problem: 'You have a `Document` class. A document can be in one of three states: `Draft`, `Moderation`, and `Published`. The `publish()` method works differently in each state. In `Draft` it moves to `Moderation`. In `Moderation` it moves to `Published` (if admin). In `Published` it does nothing. You end up with giant `if/else` or `switch` statements checking the current state.',
        solution: 'Extract state-specific behaviors into distinct State classes. The original object, called context, stores a reference to one of the state objects that represents its current state, and delegates all the state-related work to that object. To transition state, replace the active state object with another.',
        diagram: `classDiagram
    class Context {
        -state State
        +changeState(State)
        +request()
    }
    class State {
        <<interface>>
        +handle(Context)
    }
    class ConcreteStateA {
        +handle(Context)
    }
    class ConcreteStateB {
        +handle(Context)
    }
    Context o-- State
    State <|.. ConcreteStateA
    State <|.. ConcreteStateB`,
        applicability: [
          'When you have an object that behaves differently depending on its current state, the number of states is enormous, and the state-specific code changes frequently.',
          'When you have a class polluted with massive conditionals that alter how the class behaves according to the current values of the class\'s fields.',
          'When you have a lot of duplicate code across similar states and transitions of a condition-based state machine.'
        ],
        pros: [
          'Single Responsibility Principle. Organize the code related to particular states into separate classes.',
          'Open/Closed Principle. Introduce new states without changing existing state classes or the context.',
          'Simplifies the code of the context by eliminating bulky state machine conditionals.'
        ],
        cons: [
          'Applying the pattern can be overkill if a state machine has only a few states or rarely changes.'
        ],
        realWorldAnalogy: 'A smartphone. If the phone is unlocked, pressing buttons executes apps. If the phone is locked, pressing buttons goes to the unlock screen. If the battery is dead, pressing buttons does nothing. The phone\'s behavior changes based on its State.',
        pythonCode: `from abc import ABC, abstractmethod

class State(ABC):
    @abstractmethod
    def play(self): pass
    @abstractmethod
    def stop(self): pass

class PlayingState(State):
    def __init__(self, player):
        self.player = player
    def play(self):
        print("Already playing.")
    def stop(self):
        print("Stopping playback.")
        self.player.set_state(self.player.stopped_state)

class StoppedState(State):
    def __init__(self, player):
        self.player = player
    def play(self):
        print("Starting playback.")
        self.player.set_state(self.player.playing_state)
    def stop(self):
        print("Already stopped.")

class AudioPlayer:
    def __init__(self):
        self.playing_state = PlayingState(self)
        self.stopped_state = StoppedState(self)
        # Initial state
        self.state = self.stopped_state

    def set_state(self, state: State):
        self.state = state

    def press_play(self):
        self.state.play()

    def press_stop(self):
        self.state.stop()

if __name__ == '__main__':
    player = AudioPlayer()
    player.press_play()  # Starts
    player.press_play()  # Already playing
    player.press_stop()  # Stops
    player.press_stop()  # Already stopped`,
        golangCode: `package main

import "fmt"

// Context
type VendingMachine struct {
	hasMoneyState State
	noMoneyState  State
	
	currentState  State
}
func NewVendingMachine() *VendingMachine {
	v := &VendingMachine{}
	v.hasMoneyState = &HasMoneyState{vendingMachine: v}
	v.noMoneyState = &NoMoneyState{vendingMachine: v}
	v.currentState = v.noMoneyState // initial state
	return v
}
func (v *VendingMachine) setState(s State) {
	v.currentState = s
}

// State Interface
type State interface {
	InsertMoney()
	DispenseItem()
}

// Concrete State 1
type NoMoneyState struct {
	vendingMachine *VendingMachine
}
func (s *NoMoneyState) InsertMoney() {
	fmt.Println("Money inserted")
	s.vendingMachine.setState(s.vendingMachine.hasMoneyState)
}
func (s *NoMoneyState) DispenseItem() {
	fmt.Println("Please insert money first")
}

// Concrete State 2
type HasMoneyState struct {
	vendingMachine *VendingMachine
}
func (s *HasMoneyState) InsertMoney() {
	fmt.Println("Already has money")
}
func (s *HasMoneyState) DispenseItem() {
	fmt.Println("Item dispensed")
	s.vendingMachine.setState(s.vendingMachine.noMoneyState)
}

func main() {
	machine := NewVendingMachine()
	
	machine.currentState.DispenseItem() // Please insert money first
	machine.currentState.InsertMoney()  // Money inserted
	machine.currentState.DispenseItem() // Item dispensed
}`,
        recall: {
          emoji: '🚦',
          analogy: 'A traffic light. It behaves differently depending on its state (Red, Yellow, Green), and transitions automatically to the next state.',
          oneLiner: 'Allows an object to alter its behavior when its internal state changes.',
          keyPoints: [
            'Object-oriented implementation of a Finite State Machine',
            'Context delegates behavior to the current State object',
            'State transitions can be handled by the Context or by the Concrete States themselves',
            'Eliminates giant switch statements based on status codes'
          ],
          whenToUse: [
            'Media players (Play, Pause, Stop states)',
            'Document approval workflows (Draft, Review, Published states)',
            'Game character behaviors (Idle, Walking, Jumping states)'
          ],
          interviewTip: 'Compare State with Strategy. Both use composition, but in State, the states themselves often trigger transitions to other states. In Strategy, the algorithms are independent and unaware of each other.',
          codeHint: 'State interface with methods for actions. Concrete States handle actions and trigger Context.setState(new State()).'
        }
      },
      {
        id: 'template-method',
        name: 'Template Method',
        icon: '📐',
        intent: 'Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm\'s structure.',
        description: 'Template Method is a behavioral design pattern that defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps of the algorithm without changing its structure.\n\nThe pattern suggests that you break down an algorithm into a series of steps, turn these steps into methods, and put a series of calls to these methods inside a single template method. The steps may either be abstract, or have some default implementation.\n\nTo use the algorithm, the client is supposed to provide its own subclass, implement all abstract steps, and override some of the optional ones if needed (but not the template method itself).',
        problem: 'Imagine you are creating a data mining app that analyzes corporate documents. Users feed the app docs in various formats (PDF, DOC, CSV), and it extracts meaningful data. The code to open files, extract data, parse data, analyze, and report is very similar for all formats, but the exact "extract" and "parse" steps differ.',
        solution: 'Create a base class that defines the algorithm skeleton (the Template Method) invoking various step methods. Implement the common steps in the base class. Leave the varying steps as abstract for subclasses (PDFMiner, CSVMiner) to implement.',
        diagram: `classDiagram
    class AbstractClass {
        +templateMethod()
        #step1()*
        #step2()*
    }
    class ConcreteClass {
        #step1()
        #step2()
    }
    AbstractClass <|-- ConcreteClass`,
        applicability: [
          'When you want to let clients extend only particular steps of an algorithm, but not the whole algorithm or its structure.',
          'When you have several classes that contain almost identical algorithms with some minor differences. As a result, you might need to modify all classes when the algorithm changes.'
        ],
        pros: [
          'You can let clients override only certain parts of a large algorithm, making them less affected by changes that happen to other parts of the algorithm.',
          'You can pull the duplicate code into a superclass.'
        ],
        cons: [
          'Some clients may be limited by the provided skeleton of an algorithm.',
          'You might violate the Liskov Substitution Principle by suppressing a default step implementation via a subclass.',
          'Template methods tend to be harder to maintain the more steps they have.'
        ],
        realWorldAnalogy: 'Following a recipe. The algorithm to bake a cake is: Mix ingredients, Bake, Frost. The overall skeleton is identical for all cakes, but the subclasses (ChocolateCake, VanillaCake) implement specific mixing and frosting steps differently.',
        pythonCode: `from abc import ABC, abstractmethod

class DataMiner(ABC):
    # Template method
    def mine_data(self, path: str):
        file = self.open_file(path)
        data = self.extract_data(file)
        analysis = self.analyze_data(data)
        self.send_report(analysis)
        self.close_file(file)

    def open_file(self, path: str) -> str:
        print(f"Opening file: {path}")
        return "file_handle"

    def close_file(self, file: str):
        print("Closing file.")

    def analyze_data(self, data: str) -> str:
        print("Analyzing generic data...")
        return "analysis_result"

    def send_report(self, analysis: str):
        print(f"Sending report: {analysis}")

    # Abstract steps to be implemented by subclasses
    @abstractmethod
    def extract_data(self, file: str) -> str: pass

class PDFMiner(DataMiner):
    def extract_data(self, file: str) -> str:
        print("Extracting data from PDF.")
        return "pdf_data"

class CSVMiner(DataMiner):
    def extract_data(self, file: str) -> str:
        print("Extracting data from CSV.")
        return "csv_data"

if __name__ == '__main__':
    print("Mining PDF:")
    pdf_miner = PDFMiner()
    pdf_miner.mine_data("doc.pdf")
    
    print("\\nMining CSV:")
    csv_miner = CSVMiner()
    csv_miner.mine_data("data.csv")`,
        golangCode: `package main

import "fmt"

// IOtp defines the interface for steps that vary
type IOtp interface {
	genRandomOTP(int) string
	saveOTPCache(string)
	getMessage(string) string
	sendNotification(string) error
}

// OTP struct acts as the Base Class with the Template Method
type OTP struct {
	iOtp IOtp
}

// The Template Method
func (o *OTP) genAndSendOTP(otpLength int) error {
	otp := o.iOtp.genRandomOTP(otpLength)
	o.iOtp.saveOTPCache(otp)
	message := o.iOtp.getMessage(otp)
	err := o.iOtp.sendNotification(message)
	return err
}

// Concrete Implementation for SMS
type Sms struct {
	OTP
}
func (s *Sms) genRandomOTP(len int) string { return "1234" }
func (s *Sms) saveOTPCache(otp string) { fmt.Println("Saving SMS OTP to Cache") }
func (s *Sms) getMessage(otp string) string { return "SMS OTP is " + otp }
func (s *Sms) sendNotification(message string) error {
	fmt.Println("Sending SMS:", message)
	return nil
}

func main() {
	// Note: Go doesn't have classical inheritance, so we compose the template method
	smsOTP := &Sms{}
	o := OTP{iOtp: smsOTP}
	o.genAndSendOTP(4)
}`,
        recall: {
          emoji: '📐',
          analogy: 'Building a custom house. The foundation and framing (Template) are done by the builder, but you pick the paint colors and flooring (Subclasses filling in steps).',
          oneLiner: 'Defines the skeleton of an algorithm, deferring specific steps to subclasses.',
          keyPoints: [
            'Relies on inheritance (subclassing)',
            'Base class defines a final/non-overridable template method calling abstract step methods',
            'Subclasses implement abstract methods but cannot change the execution order',
            'Inverts control ("Hollywood Principle": Don\'t call us, we\'ll call you)'
          ],
          whenToUse: [
            'Data parsing workflows (extract, parse, save)',
            'Lifecycle hooks in frameworks (e.g., React\'s componentDidMount, componentWillUnmount)',
            'Build pipelines (compile, test, deploy)'
          ],
          interviewTip: 'Template Method uses Inheritance. Strategy uses Composition. Template Method alters parts of an algorithm. Strategy alters the entire algorithm.',
          codeHint: 'Base class has a method `execute()` calling `step1()`, `step2()`. Subclasses override the steps.'
        }
      },
      {
        id: 'chain-of-responsibility',
        name: 'Chain of Responsibility',
        icon: '⛓️',
        intent: 'Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.',
        description: 'Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.\n\nThe pattern allows multiple objects to handle the request without coupling sender class to the concrete classes of the receivers. The chain can be composed dynamically at runtime with any handler that follows a standard handler interface.\n\nLike many other behavioral patterns, the Chain of Responsibility relies on transforming particular behaviors into stand-alone objects called handlers.',
        problem: 'You are building an e-commerce checkout system. You need to perform several checks sequentially: authentication, authorization, validation, caching. If you hardcode these checks into a massive procedural function, adding new checks or changing their order requires modifying the core code.',
        solution: 'Extract each check into its own Handler object. Link them into a chain (Auth -> Validation -> Cache). When a request comes in, it travels down the chain. If a handler can handle it (or finds an error), it stops the chain. Otherwise, it passes it to the next handler.',
        diagram: `classDiagram
    class Handler {
        <<interface>>
        +setNext(Handler)
        +handle(request)
    }
    class BaseHandler {
        -next Handler
        +setNext(Handler)
        +handle(request)
    }
    class ConcreteHandlerA {
        +handle(request)
    }
    class ConcreteHandlerB {
        +handle(request)
    }
    Handler <|.. BaseHandler
    BaseHandler <|-- ConcreteHandlerA
    BaseHandler <|-- ConcreteHandlerB
    BaseHandler o-- Handler`,
        applicability: [
          'When your program is expected to process different kinds of requests in various ways, but the exact types of requests and their sequences are unknown beforehand.',
          'When it\'s essential to execute several handlers in a particular order.',
          'When the set of handlers and their order are supposed to change at runtime.'
        ],
        pros: [
          'You can control the order of request handling.',
          'Single Responsibility Principle. You can decouple classes that invoke operations from classes that perform operations.',
          'Open/Closed Principle. You can introduce new handlers into the app without breaking the existing client code.'
        ],
        cons: [
          'Some requests may end up unhandled if they reach the end of the chain without being caught.'
        ],
        realWorldAnalogy: 'Calling tech support. First, you talk to an AI bot. If it can\'t help, you are routed to a Level 1 agent. If they can\'t help, you go to a Level 2 engineer. The request moves up the chain until someone handles it.',
        pythonCode: `from abc import ABC, abstractmethod

class Handler(ABC):
    @abstractmethod
    def set_next(self, handler: 'Handler') -> 'Handler': pass
    @abstractmethod
    def handle(self, request) -> str: pass

class AbstractHandler(Handler):
    _next_handler: Handler = None

    def set_next(self, handler: Handler) -> Handler:
        self._next_handler = handler
        return handler

    @abstractmethod
    def handle(self, request):
        if self._next_handler:
            return self._next_handler.handle(request)
        return None

class MonkeyHandler(AbstractHandler):
    def handle(self, request):
        if request == "Banana":
            return f"Monkey: I'll eat the {request}"
        else:
            return super().handle(request)

class SquirrelHandler(AbstractHandler):
    def handle(self, request):
        if request == "Nut":
            return f"Squirrel: I'll eat the {request}"
        else:
            return super().handle(request)

if __name__ == '__main__':
    monkey = MonkeyHandler()
    squirrel = SquirrelHandler()
    
    # Form the chain: Monkey -> Squirrel
    monkey.set_next(squirrel)
    
    # Client sends requests to the start of the chain
    for food in ["Nut", "Banana", "Coffee"]:
        print(f"Client: Who wants a {food}?")
        result = monkey.handle(food)
        if result:
            print(f"  {result}")
        else:
            print(f"  {food} was left untouched.")`,
        golangCode: `package main

import "fmt"

// Handler Interface
type Department interface {
	Execute(*Patient)
	SetNext(Department)
}

// Patient context
type Patient struct {
	name              string
	registrationDone  bool
	doctorCheckUpDone bool
	medicineDone      bool
}

// Concrete Handlers
type Reception struct {
	next Department
}
func (r *Reception) Execute(p *Patient) {
	if p.registrationDone {
		fmt.Println("Patient registration already done")
		r.next.Execute(p)
		return
	}
	fmt.Println("Reception registering patient")
	p.registrationDone = true
	r.next.Execute(p)
}
func (r *Reception) SetNext(next Department) { r.next = next }

type Doctor struct {
	next Department
}
func (d *Doctor) Execute(p *Patient) {
	if p.doctorCheckUpDone {
		fmt.Println("Doctor checkup already done")
		d.next.Execute(p)
		return
	}
	fmt.Println("Doctor checking patient")
	p.doctorCheckUpDone = true
	d.next.Execute(p)
}
func (d *Doctor) SetNext(next Department) { d.next = next }

type Pharmacy struct {
	next Department
}
func (m *Pharmacy) Execute(p *Patient) {
	if p.medicineDone {
		fmt.Println("Medicine already given")
		return
	}
	fmt.Println("Pharmacy giving medicine")
	p.medicineDone = true
}
func (m *Pharmacy) SetNext(next Department) { m.next = next }

func main() {
	pharmacy := &Pharmacy{}
	doctor := &Doctor{}
	doctor.SetNext(pharmacy)
	reception := &Reception{}
	reception.SetNext(doctor)

	patient := &Patient{name: "John"}
	// Start the chain
	reception.Execute(patient)
}`,
        recall: {
          emoji: '⛓️',
          analogy: 'A bucket brigade putting out a fire. People pass the bucket down the line. If someone can use the bucket, they stop passing it.',
          oneLiner: 'Passes requests along a chain of handlers until one of them handles it.',
          keyPoints: [
            'Handlers implement a common interface with `setNext` and `handle`',
            'Request travels sequentially',
            'Avoids coupling sender to receiver',
            'Chain can be modified dynamically at runtime'
          ],
          whenToUse: [
            'Express/Node.js Middleware (req, res, next)',
            'Event bubbling in DOM (click on child bubbles up to parents)',
            'Logging frameworks passing log events to different targets based on severity'
          ],
          interviewTip: 'Mention Middleware. If you understand Express.js or Spring Boot filters, you understand Chain of Responsibility.',
          codeHint: 'Each handler has a reference to the next handler. In `handle()`, if it can process, it does. Else, it calls `next.handle()`.'
        }
      },
      {
        id: 'mediator',
        name: 'Mediator',
        icon: '🗼',
        intent: 'Define an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly.',
        description: 'Mediator is a behavioral design pattern that lets you reduce chaotic dependencies between objects. The pattern restricts direct communications between the objects and forces them to collaborate only via a mediator object.\n\nWhen components have too many direct relationships, they become tightly coupled and impossible to reuse. A change in one class forces changes in many others. This is often called "Spaghetti Code".\n\nThe Mediator pattern solves this by making components communicate through a central Mediator. Components don\'t know about each other; they only know about the Mediator. When a component does something, it notifies the Mediator, which then decides which other components should react.',
        problem: 'Say you have a dialog for creating customer profiles. It consists of text fields, checkboxes, and buttons. When a user clicks "I have a dog", a hidden text field "Dog\'s name" must appear. If you link the checkbox directly to the text field, the UI components become tightly coupled to each other and cannot be reused in other dialogs.',
        solution: 'Introduce a Dialog (Mediator) class. The checkbox simply says "I was toggled" to the Mediator. The Mediator contains the logic that says "When dog checkbox is toggled, show the dog text field." Components only hold a reference to the Mediator.',
        diagram: `classDiagram
    class Mediator {
        <<interface>>
        +notify(sender, event)
    }
    class ConcreteMediator {
        +notify(sender, event)
    }
    class BaseComponent {
        #mediator Mediator
    }
    class ComponentA {
        +doA()
    }
    class ComponentB {
        +doB()
    }
    Mediator <|.. ConcreteMediator
    BaseComponent <|-- ComponentA
    BaseComponent <|-- ComponentB
    BaseComponent --> Mediator
    ConcreteMediator --> ComponentA
    ConcreteMediator --> ComponentB`,
        applicability: [
          'When it\'s hard to change some of the classes because they are tightly coupled to a bunch of other classes.',
          'When you can\'t reuse a component in a different program because it\'s too dependent on other components.',
          'When you find yourself creating tons of component subclasses just to reuse some basic behavior in various contexts.'
        ],
        pros: [
          'Single Responsibility Principle. You can extract the communications between various components into a single place, making it easier to comprehend and maintain.',
          'Open/Closed Principle. You can introduce new mediators without having to change the actual components.',
          'You can reduce coupling between various components of a program.',
          'You can reuse individual components more easily.'
        ],
        cons: [
          'Over time a mediator can evolve into a God Object.'
        ],
        realWorldAnalogy: 'Air Traffic Control (ATC). Airplanes don\'t communicate directly with each other to decide who lands first. They all communicate with the ATC tower, which orchestrates the complex landing sequences.',
        pythonCode: `from abc import ABC, abstractmethod

class Mediator(ABC):
    @abstractmethod
    def notify(self, sender: object, event: str) -> None: pass

class BaseComponent:
    def __init__(self, mediator: Mediator = None):
        self._mediator = mediator

    @property
    def mediator(self) -> Mediator:
        return self._mediator

    @mediator.setter
    def mediator(self, mediator: Mediator):
        self._mediator = mediator

class Component1(BaseComponent):
    def do_a(self):
        print("Component 1 does A.")
        self.mediator.notify(self, "A")

class Component2(BaseComponent):
    def do_c(self):
        print("Component 2 does C.")
        self.mediator.notify(self, "C")

class ConcreteMediator(Mediator):
    def __init__(self, c1: Component1, c2: Component2):
        self._c1 = c1
        self._c1.mediator = self
        self._c2 = c2
        self._c2.mediator = self

    def notify(self, sender: object, event: str) -> None:
        if event == "A":
            print("Mediator reacts on A and triggers following operations:")
            self._c2.do_c()

if __name__ == '__main__':
    c1 = Component1()
    c2 = Component2()
    mediator = ConcreteMediator(c1, c2)

    print("Client triggers operation A.")
    c1.do_a()`,
        golangCode: `package main

import "fmt"

// Mediator Interface
type Mediator interface {
	CanLand(train *Train) bool
	NotifyAboutDeparture()
}

// Concrete Mediator
type StationManager struct {
	isPlatformFree bool
	trainQueue     []*Train
}
func NewStationManager() *StationManager {
	return &StationManager{isPlatformFree: true}
}
func (s *StationManager) CanLand(t *Train) bool {
	if s.isPlatformFree {
		s.isPlatformFree = false
		return true
	}
	s.trainQueue = append(s.trainQueue, t)
	return false
}
func (s *StationManager) NotifyAboutDeparture() {
	if !s.isPlatformFree {
		s.isPlatformFree = true
	}
	if len(s.trainQueue) > 0 {
		firstTrain := s.trainQueue[0]
		s.trainQueue = s.trainQueue[1:]
		firstTrain.PermitArrival()
	}
}

// Colleague (Component)
type Train struct {
	name     string
	mediator Mediator
}
func (t *Train) Arrive() {
	if !t.mediator.CanLand(t) {
		fmt.Printf("Train %s: Arrival blocked, waiting\\n", t.name)
		return
	}
	fmt.Printf("Train %s: Arrived\\n", t.name)
}
func (t *Train) Depart() {
	fmt.Printf("Train %s: Leaving\\n", t.name)
	t.mediator.NotifyAboutDeparture()
}
func (t *Train) PermitArrival() {
	fmt.Printf("Train %s: Permitted to arrive\\n", t.name)
	t.Arrive()
}

func main() {
	stationManager := NewStationManager()
	
	train1 := &Train{name: "Express 1", mediator: stationManager}
	train2 := &Train{name: "Local 2", mediator: stationManager}
	
	train1.Arrive()
	train2.Arrive() // Will be blocked
	
	train1.Depart() // Will unblock train 2
}`,
        recall: {
          emoji: '🗼',
          analogy: 'An Air Traffic Control tower. Planes don\'t talk to each other to coordinate landings; they all talk to the tower, which orchestrates everything.',
          oneLiner: 'Centralizes complex communications and control logic between objects.',
          keyPoints: [
            'Reduces N:M relationships to 1:M relationships',
            'Components only know about the Mediator, not each other',
            'Centralizes control logic',
            'Risk of creating a "God Object"'
          ],
          whenToUse: [
            'Complex UI dialogs where changing one field affects many others',
            'Chat rooms where users don\'t connect peer-to-peer but via server',
            'Event bus architectures'
          ],
          interviewTip: 'Compare Mediator with Observer. In Observer, receivers are dynamically subscribed and sender broadcasts. In Mediator, the central hub explicitly coordinates logic between known components.',
          codeHint: 'Components hold a reference to Mediator. Call `mediator.notify(this, event)`. Mediator routes it.'
        }
      },
      {
        id: 'memento',
        name: 'Memento',
        icon: '💾',
        intent: 'Without violating encapsulation, capture and externalize an object\'s internal state so that the object can be restored to this state later.',
        description: 'Memento is a behavioral design pattern that lets you save and restore the previous state of an object without revealing the details of its implementation.\n\nThe pattern delegates creating the state snapshots to the actual owner of that state, the originator object. Hence, instead of other objects trying to copy the editor\'s state from the outside, the editor class itself makes the snapshot since it has full access to its own state.\n\nThe pattern consists of three parts: Originator (object whose state needs saving), Memento (the snapshot object), and Caretaker (object that keeps track of the mementos). The Memento is opaque to the Caretaker; it can\'t read or modify the state inside.',
        problem: 'You are building a text editor and want to implement Undo. You write code that saves the editor\'s state (text, cursor position) before every action. But to save the state, the editor class must expose its private fields to the outside world, violating encapsulation.',
        solution: 'Let the editor (Originator) create a snapshot of itself, returning a Memento object. The Memento class restricts access to its data from all objects except the Originator. The history manager (Caretaker) stores Mementos in a stack and passes them back to the Originator when Undo is called.',
        diagram: `classDiagram
    class Originator {
        -state
        +save() Memento
        +restore(Memento)
    }
    class Memento {
        -state
        +getState()
    }
    class Caretaker {
        -history List~Memento~
        +undo()
    }
    Caretaker o-- Memento
    Originator ..> Memento : creates`,
        applicability: [
          'When you want to produce snapshots of the object\'s state to be able to restore a previous state of the object.',
          'When direct access to the object\'s fields/getters/setters violates its encapsulation.'
        ],
        pros: [
          'You can produce snapshots of the object\'s state without violating its encapsulation.',
          'You can simplify the originator\'s code by letting the caretaker maintain the history of the originator\'s state.'
        ],
        cons: [
          'The app might consume lots of RAM if clients create mementos too often.',
          'Caretakers should track the originator\'s lifecycle to be able to destroy obsolete mementos.',
          'Most dynamic programming languages can\'t guarantee that the state within the memento stays untouched.'
        ],
        realWorldAnalogy: 'Video game save files. You play a game (Originator). You hit a save point, which produces a save file (Memento). The file system stores it (Caretaker). Later, you die and load the file, restoring the exact state you were in.',
        pythonCode: `class Memento:
    def __init__(self, state: str):
        self._state = state
        
    def get_state(self) -> str:
        return self._state

class Originator:
    def __init__(self, state: str):
        self._state = state
        print(f"Originator: Initial state is '{self._state}'")
        
    def change_state(self, new_state: str):
        self._state = new_state
        print(f"Originator: State changed to '{self._state}'")
        
    def save(self) -> Memento:
        print("Originator: Saving state to Memento.")
        return Memento(self._state)
        
    def restore(self, memento: Memento):
        self._state = memento.get_state()
        print(f"Originator: Restored state to '{self._state}'")

class Caretaker:
    def __init__(self, originator: Originator):
        self._mementos = []
        self._originator = originator
        
    def backup(self):
        self._mementos.append(self._originator.save())
        
    def undo(self):
        if not len(self._mementos):
            return
        memento = self._mementos.pop()
        self._originator.restore(memento)

if __name__ == '__main__':
    originator = Originator("Version 1")
    caretaker = Caretaker(originator)
    
    caretaker.backup()
    originator.change_state("Version 2")
    
    caretaker.backup()
    originator.change_state("Version 3")
    
    print("\\nRolling back...")
    caretaker.undo()
    caretaker.undo()`,
        golangCode: `package main

import "fmt"

// Memento
type Memento struct {
	state string
}
func (m *Memento) getSavedState() string {
	return m.state
}

// Originator
type Originator struct {
	state string
}
func (o *Originator) setState(state string) {
	fmt.Println("Setting state to:", state)
	o.state = state
}
func (o *Originator) saveStateToMemento() *Memento {
	return &Memento{state: o.state}
}
func (o *Originator) getStateFromMemento(m *Memento) {
	o.state = m.getSavedState()
	fmt.Println("Restored state to:", o.state)
}

// Caretaker
type Caretaker struct {
	mementoArray []*Memento
}
func (c *Caretaker) addMemento(m *Memento) {
	c.mementoArray = append(c.mementoArray, m)
}
func (c *Caretaker) getMemento(index int) *Memento {
	return c.mementoArray[index]
}

func main() {
	caretaker := &Caretaker{}
	originator := &Originator{}

	originator.setState("State #1")
	originator.setState("State #2")
	caretaker.addMemento(originator.saveStateToMemento())

	originator.setState("State #3")
	caretaker.addMemento(originator.saveStateToMemento())

	originator.setState("State #4")

	// Rollback
	originator.getStateFromMemento(caretaker.getMemento(1)) // restores State #3
	originator.getStateFromMemento(caretaker.getMemento(0)) // restores State #2
}`,
        recall: {
          emoji: '💾',
          analogy: 'Saving your game. The game console (Caretaker) holds the save file (Memento), but only the game engine (Originator) knows how to read its internal data.',
          oneLiner: 'Captures and restores an object\'s internal state without violating encapsulation.',
          keyPoints: [
            'Originator creates the Memento containing a snapshot of its state',
            'Caretaker holds the Memento but cannot inspect or modify it',
            'Protects encapsulation (private fields stay private)',
            'Often used together with the Command pattern for Undo functionality'
          ],
          whenToUse: [
            'Implementing Undo/Redo features in text/graphic editors',
            'Database transactions (rollback)',
            'Wizard dialogs where you can go back to previous screens'
          ],
          interviewTip: 'Always mention Encapsulation. Memento is the exact pattern designed to solve the problem of saving private state without exposing private fields.',
          codeHint: 'Originator returns new Memento(state). Caretaker stores it. Originator.restore(memento) sets state back.'
        }
      },
      {
        id: 'visitor',
        name: 'Visitor',
        icon: '🚶',
        intent: 'Represent an operation to be performed on the elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements on which it operates.',
        description: 'Visitor is a behavioral design pattern that lets you separate algorithms from the objects on which they operate.\n\nThe pattern suggests that you place the new behavior into a separate class called visitor, instead of trying to integrate it into existing classes. The original object that had to perform the behavior is now passed to one of the visitor\'s methods as an argument, providing the method access to all necessary data contained within the object.\n\nVisitor uses a technique called Double Dispatch to execute the proper method on the visitor object without cumbersome conditional statements based on the node class.',
        problem: 'Your team develops a geographic information system that works with nodes representing Cities, Industries, and Sightseeing. You need to export these nodes to XML. You don\'t want to alter the node classes because they are stable and modifying them risks introducing bugs. Also, exporting XML feels like out-of-place logic for a geometric node.',
        solution: 'Create an `XMLExportVisitor` class. Give it methods like `visitCity(City)`, `visitIndustry(Industry)`. Add a single `accept(Visitor)` method to the node interfaces. When a node accepts a visitor, it calls the visitor method corresponding to its own class (e.g., `visitor.visitCity(this)`).',
        diagram: `classDiagram
    class Element {
        <<interface>>
        +accept(Visitor)
    }
    class ConcreteElementA {
        +accept(Visitor)
    }
    class ConcreteElementB {
        +accept(Visitor)
    }
    class Visitor {
        <<interface>>
        +visitA(ConcreteElementA)
        +visitB(ConcreteElementB)
    }
    class ConcreteVisitor {
        +visitA(ConcreteElementA)
        +visitB(ConcreteElementB)
    }
    Element <|.. ConcreteElementA
    Element <|.. ConcreteElementB
    Visitor <|.. ConcreteVisitor`,
        applicability: [
          'When you need to perform an operation on all elements of a complex object structure (for example, an object tree).',
          'To clean up the business logic of auxiliary behaviors.',
          'When a behavior makes sense only in some classes of a class hierarchy, but not in others.'
        ],
        pros: [
          'Open/Closed Principle. You can introduce a new behavior that can work with objects of different classes without changing these classes.',
          'Single Responsibility Principle. You can move multiple versions of the same behavior into the same class.',
          'A visitor object can accumulate some useful information while working with various objects.'
        ],
        cons: [
          'You need to update all visitors each time a class gets added to or removed from the element hierarchy.',
          'Visitors might lack the necessary access to the private fields and methods of the elements that they\'re supposed to work with.'
        ],
        realWorldAnalogy: 'An insurance agent (Visitor) visits different buildings. When visiting a Residential Building (Element A), they sell home insurance. When visiting a Commercial Building (Element B), they sell fire and liability insurance. The buildings don\'t need to know how to calculate insurance.',
        pythonCode: `from abc import ABC, abstractmethod

# Visitor Interface
class Visitor(ABC):
    @abstractmethod
    def visit_book(self, book): pass
    @abstractmethod
    def visit_fruit(self, fruit): pass

# Element Interface
class ItemElement(ABC):
    @abstractmethod
    def accept(self, visitor: Visitor): pass

# Concrete Elements
class Book(ItemElement):
    def __init__(self, price: float):
        self.price = price
    def accept(self, visitor: Visitor):
        visitor.visit_book(self)

class Fruit(ItemElement):
    def __init__(self, price: float, weight: float):
        self.price = price
        self.weight = weight
    def accept(self, visitor: Visitor):
        visitor.visit_fruit(self)

# Concrete Visitor
class ShoppingCartVisitor(Visitor):
    def visit_book(self, book: Book):
        print("Book visited. Calculating price.")
        return book.price

    def visit_fruit(self, fruit: Fruit):
        print("Fruit visited. Calculating price by weight.")
        return fruit.price * fruit.weight

if __name__ == '__main__':
    items = [Book(20), Fruit(2, 5)]
    visitor = ShoppingCartVisitor()
    
    total = 0
    for item in items:
        # Double dispatch: item calls visitor.visit_X(self)
        total += item.accept(visitor)
        
    print(f"Total Cost: {total} USD")`,
        golangCode: `package main

import "fmt"

// Visitor Interface
type Visitor interface {
	visitForSquare(*Square)
	visitForCircle(*Circle)
}

// Element Interface
type Shape interface {
	accept(Visitor)
}

// Concrete Elements
type Square struct {
	side int
}
func (s *Square) accept(v Visitor) {
	v.visitForSquare(s) // Double Dispatch
}

type Circle struct {
	radius int
}
func (c *Circle) accept(v Visitor) {
	v.visitForCircle(c)
}

// Concrete Visitor
type AreaCalculator struct {
	area int
}
func (a *AreaCalculator) visitForSquare(s *Square) {
	fmt.Println("Calculating area for Square")
}
func (a *AreaCalculator) visitForCircle(c *Circle) {
	fmt.Println("Calculating area for Circle")
}

func main() {
	sq := &Square{side: 2}
	c := &Circle{radius: 3}
	
	areaCalculator := &AreaCalculator{}
	
	shapes := []Shape{sq, c}
	for _, shape := range shapes {
		shape.accept(areaCalculator)
	}
}`,
        recall: {
          emoji: '🚶',
          analogy: 'A tax inspector visiting different types of businesses. The inspector knows how to audit a restaurant and a software company. The businesses just open their doors (accept) to the inspector.',
          oneLiner: 'Lets you define a new operation without changing the classes of the elements on which it operates.',
          keyPoints: [
            'Separates algorithms from object structures',
            'Relies on Double Dispatch (`element.accept(visitor)` calls `visitor.visitElement(element)`)',
            'Great for adding functionality to external/closed class hierarchies',
            'Painful if the element hierarchy changes often (must update all visitors)'
          ],
          whenToUse: [
            'Compilers processing Abstract Syntax Trees (ASTs)',
            'Exporting complex object structures (DOM, hierarchies) to different formats (JSON, XML)',
            'Performing metrics collection on diverse object trees'
          ],
          interviewTip: 'Mention "Double Dispatch". It\'s the mechanism that makes Visitor work, resolving the correct method to call dynamically based on BOTH the visitor type and the element type.',
          codeHint: 'Element has `accept(v) { v.visitElement(this); }`. Visitor has overloaded `visitElement()` methods.'
        }
      },
      {
        id: 'interpreter',
        name: 'Interpreter',
        icon: '📖',
        intent: 'Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.',
        description: 'Interpreter is a behavioral design pattern that defines a grammatical representation for a language and provides an interpreter to deal with this grammar.\n\nIt is used to define how a language can be parsed and executed. The pattern maps every rule of a grammar to a class. These classes are typically organized in a composite-like tree structure, where leaf nodes are terminal expressions (like numbers) and branch nodes are non-terminal expressions (like operations).\n\nWhile it\'s not used frequently in everyday web development, it is vital when you need to parse structured text like mathematical expressions, regex, SQL queries, or custom scripting languages.',
        problem: 'You are building a search system where users can type complex query strings like `(author:Smith OR author:Jones) AND year:2020`. Writing procedural code to parse and execute these nested boolean queries is a nightmare of regex and conditionals.',
        solution: 'Represent the query as an Abstract Syntax Tree (AST). Create an `Expression` interface with an `interpret(context)` method. Create classes for Terminal expressions (`author:Smith`) and Non-Terminal expressions (`AND`, `OR`). Parse the string into a tree of these objects, then call `interpret()` on the root.',
        diagram: `classDiagram
    class Context {
        -data
    }
    class AbstractExpression {
        <<interface>>
        +interpret(Context)
    }
    class TerminalExpression {
        +interpret(Context)
    }
    class NonterminalExpression {
        -left AbstractExpression
        -right AbstractExpression
        +interpret(Context)
    }
    AbstractExpression <|.. TerminalExpression
    AbstractExpression <|.. NonterminalExpression
    NonterminalExpression o-- AbstractExpression`,
        applicability: [
          'When you need to interpret a language, and you can represent statements in the language as abstract syntax trees.',
          'When the grammar is simple. For complex grammars, tools like Parser Generators (e.g., YACC) are better.',
          'When efficiency is not a critical concern.'
        ],
        pros: [
          'Easy to change and extend the grammar (just add new Expression classes).',
          'Implementing the grammar is straightforward since classes map directly to grammar rules.'
        ],
        cons: [
          'Can become cumbersome and unmaintainable for complex grammars (too many classes).',
          'Slower than optimized parsing tools.'
        ],
        realWorldAnalogy: 'A musician reading sheet music. The sheet music is the language. The musician\'s brain interprets the symbols (terminal: notes, non-terminal: chords/repeats) and produces sound.',
        pythonCode: `from abc import ABC, abstractmethod

# Context (often holds global data or variables)
class Context:
    def __init__(self):
        self.variables = {}
        
    def set_var(self, name: str, value: bool):
        self.variables[name] = value
        
    def get_var(self, name: str) -> bool:
        return self.variables.get(name, False)

# Abstract Expression
class Expression(ABC):
    @abstractmethod
    def interpret(self, context: Context) -> bool: pass

# Terminal Expression
class Variable(Expression):
    def __init__(self, name: str):
        self.name = name
    def interpret(self, context: Context) -> bool:
        return context.get_var(self.name)

# Non-Terminal Expressions
class And(Expression):
    def __init__(self, expr1: Expression, expr2: Expression):
        self.left = expr1
        self.right = expr2
    def interpret(self, context: Context) -> bool:
        return self.left.interpret(context) and self.right.interpret(context)

class Or(Expression):
    def __init__(self, expr1: Expression, expr2: Expression):
        self.left = expr1
        self.right = expr2
    def interpret(self, context: Context) -> bool:
        return self.left.interpret(context) or self.right.interpret(context)

if __name__ == '__main__':
    context = Context()
    context.set_var("A", True)
    context.set_var("B", False)
    
    # Tree representing: A AND B
    expr1 = And(Variable("A"), Variable("B"))
    print(f"A AND B = {expr1.interpret(context)}")
    
    # Tree representing: A OR B
    expr2 = Or(Variable("A"), Variable("B"))
    print(f"A OR B = {expr2.interpret(context)}")`,
        golangCode: `package main

import (
	"fmt"
	"strings"
)

// Expression interface
type Expression interface {
	Interpret(context string) bool
}

// Terminal Expression
type TerminalExpression struct {
	data string
}
func (t *TerminalExpression) Interpret(context string) bool {
	return strings.Contains(context, t.data)
}

// Non-Terminal Expression (OR)
type OrExpression struct {
	expr1 Expression
	expr2 Expression
}
func (o *OrExpression) Interpret(context string) bool {
	return o.expr1.Interpret(context) || o.expr2.Interpret(context)
}

// Non-Terminal Expression (AND)
type AndExpression struct {
	expr1 Expression
	expr2 Expression
}
func (a *AndExpression) Interpret(context string) bool {
	return a.expr1.Interpret(context) && a.expr2.Interpret(context)
}

func main() {
	// Rule: Robert and John are male
	robert := &TerminalExpression{data: "Robert"}
	john := &TerminalExpression{data: "John"}
	isMale := &OrExpression{expr1: robert, expr2: john}

	// Rule: Julie is a married woman
	julie := &TerminalExpression{data: "Julie"}
	married := &TerminalExpression{data: "Married"}
	isMarriedWoman := &AndExpression{expr1: julie, expr2: married}

	fmt.Println("Is John male?", isMale.Interpret("John"))
	fmt.Println("Is Julie a married woman?", isMarriedWoman.Interpret("Married Julie"))
}`,
        recall: {
          emoji: '📖',
          analogy: 'Translating a sentence word by word. Each grammatical rule is a separate class that interprets a portion of the sentence.',
          oneLiner: 'Evaluates sentences in a language by building an abstract syntax tree of expressions.',
          keyPoints: [
            'Maps a grammar rule directly to a class',
            'Tree structure is very similar to the Composite pattern',
            'Terminal expressions are leaves, Non-terminal are branches',
            'Passes a Context object down the tree to hold state'
          ],
          whenToUse: [
            'Parsing simple mathematical expressions',
            'Interpreting search query languages (e.g. `type:bug status:open`)',
            'Evaluating business rules engines'
          ],
          interviewTip: 'Acknowledge that this pattern is rare in typical CRUD apps. It\'s heavily used in compilers, parsers, and regex engines.',
          codeHint: 'Expression interface with `interpret(context)`. Concrete classes for AND, OR, Variable.'
        }
      }
    ]
  }
];
