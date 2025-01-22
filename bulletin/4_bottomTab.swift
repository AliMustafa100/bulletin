import SwiftUI

struct ClubListView: View { // Renamed to avoid conflicts
    var body: some View {
        Text("Browse Clubs!")
            .font(.largeTitle)
            .padding()
    }
}

struct ContentView: View {
    var body: some View {
        TabView {
            HomepageView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
            
            ClubListView() // Updated here
                .tabItem {
                    Label("Clubs", systemImage: "person.3.fill")
                }
            
            EventsView()
                .tabItem {
                    Label("Events", systemImage: "calendar")
                }
        }
    }
}

struct HomepageView: View {
    var body: some View {
        Text("Welcome to the Homepage!")
            .font(.largeTitle)
            .padding()
    }
}

struct EventsView: View {
    var body: some View {
        Text("Explore Events!")
            .font(.largeTitle)
            .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
