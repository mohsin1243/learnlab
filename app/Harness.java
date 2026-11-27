import java.util.*;
import java.util.function.*;
import java.util.stream.*;
import java.time.*;
import java.math.*;
import java.io.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    // ---------- Sample domain (available to every snippet) ----------
    record Employee(int id, String name, String dept, double salary, int age, String gender,
                    String city, int yearOfJoining, List<String> skills) {}
    record Item(String product, String category, int qty, double price) {}
    record Order(int id, String customer, LocalDate date, String status, List<Item> items) {
        double total() { return items.stream().mapToDouble(i -> i.qty() * i.price()).sum(); }
    }
    record Trader(String name, String city) {}
    record Transaction(Trader trader, int year, int value) {}
    record Student(String name, int grade, double gpa, List<String> courses) {}

    static final List<Integer> nums = List.of(5, 12, 7, 3, 18, 21, 4, 9, 30, 15, 8, 12, 1);
    static final List<String> words = List.of("apple", "banana", "cherry", "date", "fig", "grape",
            "kiwi", "apple", "mango", "banana", "lemon");
    static final String sentence = "the quick brown fox jumps over the lazy dog the end";
    static final List<List<Integer>> matrix = List.of(List.of(1, 2, 3), List.of(4, 5, 6), List.of(7, 8, 9));

    static final List<Employee> employees = List.of(
        new Employee(1, "Asha", "Engineering", 250000, 41, "F", "Bangalore", 2015, List.of("Java", "Spring", "AWS")),
        new Employee(2, "Vikram", "Engineering", 180000, 36, "M", "Bangalore", 2016, List.of("Java", "Kafka")),
        new Employee(3, "Neha", "Engineering", 120000, 29, "F", "Pune", 2019, List.of("React", "TypeScript")),
        new Employee(4, "Rohit", "Engineering", 115000, 31, "M", "Bangalore", 2020, List.of("Python", "SQL")),
        new Employee(5, "Kiran", "Engineering", 95000, 26, "M", "Hyderabad", 2021, List.of("Java", "SQL")),
        new Employee(6, "Sara", "Sales", 160000, 38, "F", "Mumbai", 2016, List.of("Negotiation", "CRM")),
        new Employee(7, "Manoj", "Sales", 90000, 33, "M", "Mumbai", 2018, List.of("CRM")),
        new Employee(8, "Divya", "Sales", 72000, 27, "F", "Chennai", 2020, List.of("CRM", "Excel")),
        new Employee(9, "Suresh", "HR", 110000, 45, "M", "Pune", 2017, List.of("Recruiting")),
        new Employee(10, "Meera", "HR", 65000, 30, "F", "Pune", 2019, List.of("Recruiting", "Excel")),
        new Employee(11, "Lakshmi", "Finance", 170000, 48, "F", "Mumbai", 2015, List.of("Excel", "SQL")),
        new Employee(12, "Gaurav", "Finance", 98000, 34, "M", "Delhi", 2018, List.of("Excel")),
        new Employee(13, "Pooja", "Finance", 98000, 32, "F", "Mumbai", 2019, List.of("Excel", "Python")),
        new Employee(14, "Nisha", "Marketing", 140000, 39, "F", "Delhi", 2017, List.of("SEO", "Content")),
        new Employee(15, "Deepak", "Marketing", 76000, 28, "M", "Delhi", 2020, List.of("SEO"))
    );

    static final List<Order> orders = List.of(
        new Order(101, "Acme", LocalDate.of(2023, 1, 5), "DELIVERED", List.of(new Item("Laptop", "Electronics", 2, 1200))),
        new Order(102, "Globex", LocalDate.of(2023, 1, 12), "DELIVERED", List.of(new Item("Phone", "Electronics", 1, 800))),
        new Order(103, "Acme", LocalDate.of(2023, 2, 3), "DELIVERED", List.of(new Item("Pen", "Stationery", 10, 2), new Item("Headphones", "Electronics", 4, 150))),
        new Order(104, "Initech", LocalDate.of(2023, 2, 17), "CANCELLED", List.of(new Item("Tablet", "Electronics", 1, 450))),
        new Order(105, "Umbrella", LocalDate.of(2023, 3, 1), "DELIVERED", List.of(new Item("Laptop", "Electronics", 1, 1200), new Item("Monitor", "Electronics", 1, 350))),
        new Order(106, "Hooli", LocalDate.of(2023, 3, 9), "SHIPPED", List.of(new Item("Chair", "Furniture", 4, 180), new Item("Desk", "Furniture", 2, 300))),
        new Order(107, "Globex", LocalDate.of(2023, 4, 15), "DELIVERED", List.of(new Item("Notebook", "Stationery", 20, 5), new Item("Pen", "Stationery", 30, 2))),
        new Order(108, "Hooli", LocalDate.of(2023, 5, 2), "RETURNED", List.of(new Item("Phone", "Electronics", 1, 800))),
        new Order(109, "Acme", LocalDate.of(2023, 6, 20), "DELIVERED", List.of(new Item("Lamp", "Furniture", 3, 45), new Item("Desk", "Furniture", 1, 300))),
        new Order(110, "Initech", LocalDate.of(2024, 1, 8), "DELIVERED", List.of(new Item("Laptop", "Electronics", 1, 1150), new Item("Backpack", "Accessories", 2, 60))),
        new Order(111, "Umbrella", LocalDate.of(2024, 2, 14), "PENDING", List.of(new Item("Monitor", "Electronics", 2, 340))),
        new Order(112, "Globex", LocalDate.of(2024, 3, 3), "DELIVERED", List.of(new Item("Bookshelf", "Furniture", 1, 220), new Item("Lamp", "Furniture", 2, 45)))
    );

    static final Trader raoul = new Trader("Raoul", "Cambridge"), mario = new Trader("Mario", "Milan"),
            alan = new Trader("Alan", "Cambridge"), brian = new Trader("Brian", "Cambridge");
    static final List<Transaction> transactions = List.of(
        new Transaction(brian, 2011, 300), new Transaction(raoul, 2012, 1000), new Transaction(raoul, 2011, 400),
        new Transaction(mario, 2012, 710), new Transaction(mario, 2012, 700), new Transaction(alan, 2012, 950));

    static final List<Student> students = List.of(
        new Student("Ana", 10, 3.8, List.of("Math", "Physics")), new Student("Ben", 11, 3.2, List.of("History", "Math")),
        new Student("Cara", 10, 3.9, List.of("Biology", "Chemistry")), new Student("Dev", 12, 2.9, List.of("Math")),
        new Student("Eli", 11, 3.5, List.of("Physics", "Art")), new Student("Fay", 12, 3.7, List.of("Art", "History")));

    // ---------- Output helper: deterministic formatting for maps/sets/doubles ----------
    static String fmt(Object o) {
        if (o == null) return "null";
        if (o instanceof Double d) return String.format(Locale.ROOT, "%.2f", d);
        if (o instanceof Float f) return String.format(Locale.ROOT, "%.2f", f);
        if (o instanceof Map<?, ?> m) return m.entrySet().stream()
                .map(e -> fmt(e.getKey()) + "=" + fmt(e.getValue())).sorted().collect(Collectors.joining(", ", "{", "}"));
        if (o instanceof Set<?> s) return s.stream().map(Main::fmt).sorted().collect(Collectors.joining(", ", "[", "]"));
        if (o instanceof Collection<?> c) return c.stream().map(Main::fmt).collect(Collectors.joining(", ", "[", "]"));
        if (o instanceof Map.Entry<?, ?> e) return fmt(e.getKey()) + "=" + fmt(e.getValue());
        if (o instanceof Optional<?> op) return op.map(v -> "Optional[" + fmt(v) + "]").orElse("Optional.empty");
        if (o instanceof OptionalInt oi) return oi.isPresent() ? "OptionalInt[" + oi.getAsInt() + "]" : "OptionalInt.empty";
        if (o instanceof OptionalDouble od) return od.isPresent() ? "OptionalDouble[" + fmt(od.getAsDouble()) + "]" : "OptionalDouble.empty";
        if (o instanceof Employee e) return e.name();
        if (o instanceof Order or) return "Order#" + or.id();
        if (o instanceof Student st) return st.name();
        if (o instanceof Transaction t) return t.trader().name() + ":" + t.year() + ":" + t.value();
        if (o instanceof Trader t) return t.name();
        if (o instanceof int[] a) return Arrays.toString(a);
        if (o instanceof long[] a) return Arrays.toString(a);
        if (o instanceof double[] a) return Arrays.stream(a).mapToObj(Main::fmt).collect(Collectors.joining(", ", "[", "]"));
        if (o instanceof Object[] a) return Arrays.stream(a).map(Main::fmt).collect(Collectors.joining(", ", "[", "]"));
        return String.valueOf(o);
    }

    static void show(Object o) { System.out.println(fmt(o)); }

//__BODY__
}
