import SwiftUI

struct Club: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let boardMemberCount: Int
    let memberCount: Int
    let profileIcon: String // Name of the SF Symbol or custom image asset
}

struct ClubView: View {
    let clubs: [Club] = [
        Club(name: "#include", description: "Students driving positive change with technology.", boardMemberCount: 5, memberCount: 30, profileIcon: "desktopcomputer"),
        Club(name: "AI Student Collective", description: "A student-run organization dedicated to creating the future of AI literacy for all.", boardMemberCount: 3, memberCount: 20, profileIcon: "brain"),
        Club(name: "Photography Club", description: "Explore the art of photography.", boardMemberCount: 4, memberCount: 15, profileIcon: "camera"),
        Club(name: "Robotics Club", description: "Learn robotics and AI.", boardMemberCount: 6, memberCount: 25, profileIcon: "gear"),
        Club(name: "Chess Club", description: "Master the art of strategy.", boardMemberCount: 2, memberCount: 40, profileIcon: "checkerboard.rectangle"),
        Club(name: "Music Club", description: "Jam and create music.", boardMemberCount: 4, memberCount: 18, profileIcon: "music.note")
    ]
    
    @State private var searchTerm: String = ""

    var filteredClubs: [Club] {
        if searchTerm.isEmpty {
            return clubs
        } else {
            return clubs.filter { $0.name.localizedCaseInsensitiveContains(searchTerm) }
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 16) { // Improves scrolling performance for large lists
                    ForEach(filteredClubs) { club in
                        ClubCardView(club: club)
                            .padding(.horizontal) // Adds consistent horizontal padding
                    }
                }
                .padding(.top) // Adds padding at the top
            }
            .background(Color(UIColor.systemGroupedBackground)) // Light background for a clean look
            .navigationTitle("Clubs")
            .searchable(text: $searchTerm, prompt: "Search Clubs")
        }
    }
}

struct ClubCardView: View {
    let club: Club
    @State private var isFavorited = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with Icon and Title
            HStack {
                Image(systemName: club.profileIcon)
                    .resizable()
                    .frame(width: 40, height: 40)
                    .foregroundColor(.blue) // Primary color for icons
                    .accessibilityLabel("\(club.name) icon")
                Text(club.name)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.blue) // Primary color for club names
                Spacer()
                Button(action: {
                    isFavorited.toggle()
                }) {
                    Image(systemName: isFavorited ? "star.fill" : "star")
                        .foregroundColor(isFavorited ? .yellow : .gray) // Yellow for favorited, gray otherwise
                        .accessibilityLabel(isFavorited ? "Unfavorite \(club.name)" : "Favorite \(club.name)")
                }
            }

            // Description
            Text(club.description)
                .font(.subheadline)
                .foregroundColor(.secondary) // Neutral color for descriptions

            // Stats
            HStack {
                Text("Board: \(club.boardMemberCount)")
                    .font(.footnote)
                    .foregroundColor(.secondary) // Neutral color for stats
                Spacer()
                Text("Members: \(club.memberCount)")
                    .font(.footnote)
                    .foregroundColor(.secondary) // Neutral color for stats
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white) // White card background
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2) // Subtle shadow for depth
        )
    }
}

struct ClubView_Previews: PreviewProvider {
    static var previews: some View {
        ClubView()
    }
}
