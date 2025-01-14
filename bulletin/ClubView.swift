//  mainapp.swift
//  bulletin
//
//  Created by Ali Mustafa on 1/13/25.
//

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
        Club(name: "Photography Club", description: "Explore the art of photography.", boardMemberCount: 4, memberCount: 15, profileIcon: "camera")
    ]

    var body: some View {
        ScrollView(.vertical) {
            VStack(spacing: 16) {
                ForEach(clubs) { club in
                    ClubCardView(club: club)
                }
            }
            .padding()
        }
        .background(Color(UIColor.systemGroupedBackground)) // Light background color
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
                    .foregroundColor(.blue)
                Text(club.name)
                    .font(.title3)
                    .fontWeight(.bold)
                Spacer()
                Button(action: {
                    isFavorited.toggle()
                }) {
                    Image(systemName: isFavorited ? "star.fill" : "star")
                        .foregroundColor(isFavorited ? .yellow : .gray)
                }
            }

            // Description
            Text(club.description)
                .font(.subheadline)
                .foregroundColor(.secondary)

            // Stats
            HStack {
                Text("Board: \(club.boardMemberCount)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
                Spacer()
                Text("Members: \(club.memberCount)")
                    .font(.footnote)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct ClubView_Previews: PreviewProvider {
    static var previews: some View {
        ClubView()
    }
}
