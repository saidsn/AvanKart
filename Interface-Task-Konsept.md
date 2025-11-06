# Interface - Kitabxana İdarəetmə Sistemi

## 📚 Mövzu: Interface (Interfeys)

### 🎯 Məqsəd
Bu tapşırıqda tələbələr Interface konsepsiyasını praktiki şəkildə öyrənəcəklər. Interface-lərin necə yaradılması, implement edilməsi və polymorphism-lə necə istifadə olunması öyrəniləcək.

---

## 📖 Nəzəri Hissə

### Interface nədir?
- Interface bir kontraktdır (müqavilə)
- Interface-də yalnız method imzaları (signature) olur, implementasiya olmur
- Bir class bir neçə interface-i implement edə bilər (multiple inheritance)
- Interface-dəki bütün methodlar default olaraq `public` və `abstract`-dır

### Interface vs Abstract Class
| Interface | Abstract Class |
|-----------|----------------|
| Yalnız method imzaları | Həm abstract, həm concrete methodlar |
| Multiple inheritance mümkün | Yalnız single inheritance |
| State (field) saxlaya bilməz | Field saxlaya bilər |
| Constructor ola bilməz | Constructor ola bilər |

### Java-da Interface
```java
public interface IPayable {
    void processPayment(double amount);
    double calculateFine();
}
```

### C#-da Interface
```c#
public interface IPayable {
    void ProcessPayment(double amount);
    double CalculateFine();
}
```

---

## 💼 Tapşırıq: Kitabxana İdarəetmə Sistemi

### Sistem Tələbləri

Kitabxanada müxtəlif növ elementlər var:
1. **Kitablar** - borc götürülə bilər, cərimə hesablana bilər
2. **Jurnallar** - borc götürülə bilər, cərimə hesablana bilər
3. **DVD-lər** - borc götürülə bilər, cərimə hesablana bilər
4. **Üzvlər** - ödəniş edə bilər

---

## 🏗️ Struktur

### 1. Interface-lər

#### IBorrowable (Borc götürülə bilən)
```java
public interface IBorrowable {
    void borrow(String memberName);
    void returnItem();
    boolean isAvailable();
    int getDaysOverdue();
}
```

#### IPayable (Ödəniş edə bilən)
```java
public interface IPayable {
    double calculateFine();
    void processPayment(double amount);
    double getBalance();
}
```

---

### 2. Base Class

#### LibraryItem (Əsas sinif)
```java
public abstract class LibraryItem {
    protected String title;
    protected String itemId;
    protected boolean available;
    
    public LibraryItem(String title, String itemId) {
        this.title = title;
        this.itemId = itemId;
        this.available = true;
    }
    
    public abstract void displayInfo();
    
    // Getters
    public String getTitle() { return title; }
    public String getItemId() { return itemId; }
}
```

---

### 3. Concrete Classes

#### Book (Kitab)
```java
public class Book extends LibraryItem implements IBorrowable, IPayable {
    private String author;
    private String borrowerName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private double fineAmount;
    
    public Book(String title, String itemId, String author) {
        super(title, itemId);
        this.author = author;
        this.fineAmount = 0;
    }
    
    @Override
    public void borrow(String memberName) {
        if (available) {
            this.borrowerName = memberName;
            this.borrowDate = LocalDate.now();
            this.dueDate = borrowDate.plusDays(14); // 14 gün müddət
            this.available = false;
            System.out.println(memberName + " kitabı götürdü: " + title);
        } else {
            System.out.println("Kitab mövcud deyil!");
        }
    }
    
    @Override
    public void returnItem() {
        if (!available) {
            this.available = true;
            int daysOverdue = getDaysOverdue();
            if (daysOverdue > 0) {
                fineAmount += daysOverdue * 0.5; // Hər gün 0.5 AZN cərimə
                System.out.println("Gecikmiş gün: " + daysOverdue + ", Cərimə: " + fineAmount + " AZN");
            }
            System.out.println(borrowerName + " kitabı qaytardı: " + title);
            this.borrowerName = null;
            this.borrowDate = null;
            this.dueDate = null;
        }
    }
    
    @Override
    public boolean isAvailable() {
        return available;
    }
    
    @Override
    public int getDaysOverdue() {
        if (dueDate != null && LocalDate.now().isAfter(dueDate)) {
            return (int) ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }
        return 0;
    }
    
    @Override
    public double calculateFine() {
        return fineAmount;
    }
    
    @Override
    public void processPayment(double amount) {
        if (amount >= fineAmount) {
            System.out.println(amount + " AZN ödəniş edildi. Cərimə silindi.");
            fineAmount = 0;
        } else {
            fineAmount -= amount;
            System.out.println(amount + " AZN ödəniş edildi. Qalan cərimə: " + fineAmount + " AZN");
        }
    }
    
    @Override
    public double getBalance() {
        return fineAmount;
    }
    
    @Override
    public void displayInfo() {
        System.out.println("Kitab: " + title + " | Müəllif: " + author + 
                         " | Status: " + (available ? "Mövcud" : "Borc götürülüb"));
        if (!available) {
            System.out.println("Borc götürən: " + borrowerName + " | Qaytarma tarixi: " + dueDate);
        }
    }
}
```

#### Magazine (Jurnal)
```java
public class Magazine extends LibraryItem implements IBorrowable, IPayable {
    private String issueNumber;
    private String borrowerName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private double fineAmount;
    
    public Magazine(String title, String itemId, String issueNumber) {
        super(title, itemId);
        this.issueNumber = issueNumber;
        this.fineAmount = 0;
    }
    
    @Override
    public void borrow(String memberName) {
        if (available) {
            this.borrowerName = memberName;
            this.borrowDate = LocalDate.now();
            this.dueDate = borrowDate.plusDays(7); // 7 gün müddət
            this.available = false;
            System.out.println(memberName + " jurnalı götürdü: " + title);
        } else {
            System.out.println("Jurnal mövcud deyil!");
        }
    }
    
    @Override
    public void returnItem() {
        if (!available) {
            this.available = true;
            int daysOverdue = getDaysOverdue();
            if (daysOverdue > 0) {
                fineAmount += daysOverdue * 0.3; // Hər gün 0.3 AZN cərimə
                System.out.println("Gecikmiş gün: " + daysOverdue + ", Cərimə: " + fineAmount + " AZN");
            }
            System.out.println(borrowerName + " jurnalı qaytardı: " + title);
            this.borrowerName = null;
            this.borrowDate = null;
            this.dueDate = null;
        }
    }
    
    @Override
    public boolean isAvailable() {
        return available;
    }
    
    @Override
    public int getDaysOverdue() {
        if (dueDate != null && LocalDate.now().isAfter(dueDate)) {
            return (int) ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }
        return 0;
    }
    
    @Override
    public double calculateFine() {
        return fineAmount;
    }
    
    @Override
    public void processPayment(double amount) {
        if (amount >= fineAmount) {
            System.out.println(amount + " AZN ödəniş edildi. Cərimə silindi.");
            fineAmount = 0;
        } else {
            fineAmount -= amount;
            System.out.println(amount + " AZN ödəniş edildi. Qalan cərimə: " + fineAmount + " AZN");
        }
    }
    
    @Override
    public double getBalance() {
        return fineAmount;
    }
    
    @Override
    public void displayInfo() {
        System.out.println("Jurnal: " + title + " | Nömrə: " + issueNumber + 
                         " | Status: " + (available ? "Mövcud" : "Borc götürülüb"));
        if (!available) {
            System.out.println("Borc götürən: " + borrowerName + " | Qaytarma tarixi: " + dueDate);
        }
    }
}
```

#### DVD
```java
public class DVD extends LibraryItem implements IBorrowable, IPayable {
    private String director;
    private int duration; // dəqiqə ilə
    private String borrowerName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private double fineAmount;
    
    public DVD(String title, String itemId, String director, int duration) {
        super(title, itemId);
        this.director = director;
        this.duration = duration;
        this.fineAmount = 0;
    }
    
    @Override
    public void borrow(String memberName) {
        if (available) {
            this.borrowerName = memberName;
            this.borrowDate = LocalDate.now();
            this.dueDate = borrowDate.plusDays(3); // 3 gün müddət
            this.available = false;
            System.out.println(memberName + " DVD götürdü: " + title);
        } else {
            System.out.println("DVD mövcud deyil!");
        }
    }
    
    @Override
    public void returnItem() {
        if (!available) {
            this.available = true;
            int daysOverdue = getDaysOverdue();
            if (daysOverdue > 0) {
                fineAmount += daysOverdue * 1.0; // Hər gün 1.0 AZN cərimə
                System.out.println("Gecikmiş gün: " + daysOverdue + ", Cərimə: " + fineAmount + " AZN");
            }
            System.out.println(borrowerName + " DVD qaytardı: " + title);
            this.borrowerName = null;
            this.borrowDate = null;
            this.dueDate = null;
        }
    }
    
    @Override
    public boolean isAvailable() {
        return available;
    }
    
    @Override
    public int getDaysOverdue() {
        if (dueDate != null && LocalDate.now().isAfter(dueDate)) {
            return (int) ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }
        return 0;
    }
    
    @Override
    public double calculateFine() {
        return fineAmount;
    }
    
    @Override
    public void processPayment(double amount) {
        if (amount >= fineAmount) {
            System.out.println(amount + " AZN ödəniş edildi. Cərimə silindi.");
            fineAmount = 0;
        } else {
            fineAmount -= amount;
            System.out.println(amount + " AZN ödəniş edildi. Qalan cərimə: " + fineAmount + " AZN");
        }
    }
    
    @Override
    public double getBalance() {
        return fineAmount;
    }
    
    @Override
    public void displayInfo() {
        System.out.println("DVD: " + title + " | Rejissor: " + director + 
                         " | Müddət: " + duration + " dəq" +
                         " | Status: " + (available ? "Mövcud" : "Borc götürülüb"));
        if (!available) {
            System.out.println("Borc götürən: " + borrowerName + " | Qaytarma tarixi: " + dueDate);
        }
    }
}
```

---

### 4. Main Class (Test)

```java
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class LibrarySystem {
    public static void main(String[] args) {
        // Kitabxana elementlərini yaradırıq
        Book book1 = new Book("Martin Eden", "B001", "Jack London");
        Book book2 = new Book("1984", "B002", "George Orwell");
        Magazine mag1 = new Magazine("National Geographic", "M001", "2025-10");
        DVD dvd1 = new DVD("Inception", "D001", "Christopher Nolan", 148);
        
        // Bütün elementləri bir list-də saxlayırıq (Polymorphism)
        List<IBorrowable> borrowableItems = new ArrayList<>();
        borrowableItems.add(book1);
        borrowableItems.add(book2);
        borrowableItems.add(mag1);
        borrowableItems.add(dvd1);
        
        System.out.println("=== KİTABXANA SİSTEMİ ===\n");
        
        // 1. Bütün elementlərin məlumatını göstəririk
        System.out.println("--- Mövcud Elementlər ---");
        for (IBorrowable item : borrowableItems) {
            if (item instanceof LibraryItem) {
                ((LibraryItem) item).displayInfo();
            }
        }
        
        System.out.println("\n--- Borc Götürmə ---");
        // 2. Ali kitab götürür
        book1.borrow("Ali Məmmədov");
        mag1.borrow("Leyla Həsənova");
        dvd1.borrow("Vüqar Əliyev");
        
        System.out.println("\n--- Status Yoxlama ---");
        System.out.println("Kitab1 mövcuddur? " + book1.isAvailable());
        System.out.println("Kitab2 mövcuddur? " + book2.isAvailable());
        
        System.out.println("\n--- Qaytarma (vaxtında) ---");
        // 3. Vaxtında qaytarma
        dvd1.returnItem();
        
        System.out.println("\n--- Cərimə Hesablama ---");
        // 4. Gecikmiş qaytarma simulyasiyası (manual olaraq due date dəyişirik)
        // Real proyektdə test üçün due date-i keçmişə set edə bilərik
        System.out.println("Kitab1 üçün cərimə: " + book1.calculateFine() + " AZN");
        System.out.println("Jurnal1 üçün cərimə: " + mag1.calculateFine() + " AZN");
        
        System.out.println("\n--- Ödəniş ---");
        // 5. Əgər cərimə varsa, ödəniş edirik
        if (book1.getBalance() > 0) {
            book1.processPayment(5.0);
        }
        
        System.out.println("\n--- Polymorphism Nümunəsi ---");
        // 6. Polymorphism: Bütün borc götürülə bilən elementləri qaytarırıq
        for (IBorrowable item : borrowableItems) {
            if (!item.isAvailable()) {
                item.returnItem();
            }
        }
        
        System.out.println("\n--- Yekun Statistika ---");
        double totalFines = 0;
        for (IBorrowable item : borrowableItems) {
            if (item instanceof IPayable) {
                totalFines += ((IPayable) item).calculateFine();
            }
        }
        System.out.println("Ümumi cərimə: " + totalFines + " AZN");
    }
}
```

---

## 📋 Tapşırıqlar

### Əsas Tapşırıq (70 bal)
1. ✅ `IBorrowable` interface-ini yaradın (10 bal)
2. ✅ `IPayable` interface-ini yaradın (10 bal)
3. ✅ `LibraryItem` abstract class-ını yaradın (10 bal)
4. ✅ `Book` class-ını yaradın və interface-ləri implement edin (15 bal)
5. ✅ `Magazine` class-ını yaradın və interface-ləri implement edin (10 bal)
6. ✅ `DVD` class-ını yaradın və interface-ləri implement edin (10 bal)
7. ✅ `LibrarySystem` main class-ında test edin (5 bal)

### Bonus Tapşırıqlar (30 bal)
1. 📱 **Member Class** (10 bal)
   - `Member` class-ı yaradın (IPayable implement etsin)
   - Üzvlük haqqı (membership fee) əlavə edin
   - Borc götürdüyü elementlərin siyahısını saxlasın
   
2. 🔍 **Search Funksiyası** (10 bal)
   - Kitabxana sistemində axtarış funksiyası əlavə edin
   - Title, author, itemId-yə görə axtarış

3. 📊 **Statistika** (10 bal)
   - Ümumi borc götürülən element sayı
   - Ümumi cərimə məbləği
   - Ən çox borc götürülən element

---

## 🎓 Öyrənilən Konseptlər

✅ Interface yaratmaq və implement etmək  
✅ Multiple interface implementation  
✅ Interface və Abstract Class arasındaki fərq  
✅ Polymorphism və Interface  
✅ Interface casting  
✅ instanceof operatoru  
✅ LocalDate və ChronoUnit istifadəsi  

---

## 📚 Faydalı Linklər

1. [Java Interface Tutorial (Oracle)](https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html)
2. [Interface in Java (GeeksforGeeks)](https://www.geeksforgeeks.org/interfaces-in-java/)
3. [C# Interfaces (Microsoft)](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces)
4. [Interface vs Abstract Class (JavaPoint)](https://www.javatpoint.com/difference-between-abstract-class-and-interface)
5. [Java Polymorphism with Interface (Programiz)](https://www.programiz.com/java-programming/polymorphism)

---

## ✅ Təslim Qaydaları

1. Kodu **GitHub Classroom**-a yükləyin
2. `README.md` faylında:
   - Necə işlətmək lazımdır (istifadə təlimatı)
   - Hansı bonus tapşırıqları etdiniz
3. Code comments yazın (Azərbaycan və ya İngilis dilində)
4. Son təslim tarixi: **[Tarix]**

---

## 🎯 Qiymətləndirmə Meyarları

| Meyar | Bal |
|-------|-----|
| Kod düzgün işləyir | 40 |
| Interface-lər düzgün implement olunub | 20 |
| Polymorphism düzgün istifadə olunub | 10 |
| Code quality və comments | 10 |
| Bonus tapşırıqlar | 30 |
| **ÜMUMİ** | **110** |

---

**Uğurlar! 🚀**
