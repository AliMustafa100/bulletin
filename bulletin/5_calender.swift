import SwiftUI

struct CalendarView: View {
    @State private var selectedDate: Date = Date()
    @State private var events: [Event] = {
        // DateFormatter to parse the event dates
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        
        // Initialize events with proper Date parsing
        return [
            Event(title: "John's Birthday", description: "All day", date: formatter.date(from: "20 September 2022") ?? Date(), icon: "gift"),
            Event(title: "Meeting", description: "15:30 - 17:00", date: formatter.date(from: "20 September 2022") ?? Date(), icon: "person.3.fill"),
            Event(title: "Romeo and Juliet Play", description: "19:00", date: formatter.date(from: "20 September 2022") ?? Date(), icon: "theatermasks"),
            Event(title: "Team Meeting", description: "15:30 - 17:00", date: formatter.date(from: "23 September 2022") ?? Date(), icon: "person.3.fill")
        ]
    }()
    
    var body: some View {
            
            VStack(spacing: 20) {
                
                HStack {
                          Text("Top Bar") // Replace with actual bar content later
                              .font(.headline)
                              .foregroundColor(.primary)
                          Spacer()
                      }
                      .frame(height: 100 ) // Reserve space
                      .padding()
                      .background(Color.gray.opacity(0.2)) // Placeholder background color
                
                // Header with Month and Year
                HeaderView(selectedDate: $selectedDate)
                    .frame(height: 50)
                
                // Calendar Grid
                CalendarGridView(selectedDate: $selectedDate)
                    .frame(width: 390, height:250)
                //                .offset(y:-100)
                
                // Events for Selected Date
                EventsListView(selectedDate: $selectedDate, events: $events)
            }
            .offset(y: -130)
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Calendar")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

struct HeaderView: View {
    @Binding var selectedDate: Date
    var body: some View {
        HStack {
            Button(action: {
                // Previous Month Logic
                selectedDate = Calendar.current.date(byAdding: .month, value: -1, to: selectedDate) ?? selectedDate
            }) {
                Image(systemName: "chevron.left")
            }
            Spacer()
            Text(selectedDate, style: .date)
                .font(.title2)
                .fontWeight(.bold)
            Spacer()
            Button(action: {
                // Next Month Logic
                selectedDate = Calendar.current.date(byAdding: .month, value: 1, to: selectedDate) ?? selectedDate
            }) {
                Image(systemName: "chevron.right")
            }
        }
    }
}

struct CalendarGridView: View {
    @Binding var selectedDate: Date
    
    var body: some View {
        VStack {
            // Days of the Week
            HStack {
                ForEach(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], id: \.self) { day in
                    Text(day)
                        .font(.footnote)
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                }
            }
            
            // Dates (Placeholder Grid)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7)) {
                ForEach(1...30, id: \.self) { day in
                    Text("\(day)")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding(8)
                        .background(
                            Circle()
                                .fill(day == Calendar.current.component(.day, from: selectedDate) ? Color.blue : Color.clear)
                        )
                        .foregroundColor(day == Calendar.current.component(.day, from: selectedDate) ? .white : .primary)
                        .onTapGesture {
                            // Update Selected Date
                            if let newDate = Calendar.current.date(bySetting: .day, value: day, of: selectedDate) {
                                selectedDate = newDate
                            }
                        }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 3)
    }
}

struct EventsListView: View {
    @Binding var selectedDate: Date
    @Binding var events: [Event]
    
    var filteredEvents: [Event] {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        let selectedDateString = formatter.string(from: selectedDate)
        return events.filter { formatter.string(from: $0.date) == selectedDateString }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Tasks for \(selectedDate, style: .date)")
                .font(.headline)
            
            ForEach(filteredEvents) { event in
                HStack {
                    Image(systemName: event.icon)
                        .resizable()
                        .frame(width: 24, height: 24)
                        .foregroundColor(.blue)
                    VStack(alignment: .leading) {
                        Text(event.title)
                            .font(.subheadline)
                            .fontWeight(.bold)
                        Text(event.description)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
                .shadow(radius: 3)
            }
        }
    }
}

struct Event: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let date: Date
    let icon: String
}

struct CalendarView_Previews: PreviewProvider {
    static var previews: some View {
        CalendarView()
    }
}
