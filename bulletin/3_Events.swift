import SwiftUI

// Going to change Opportunity Cards to Event Cards soon

struct OpportunityCard: View {
    let title: String
    let subtitle: String
    let date: String
    let location: String
    let description: String

    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
                .foregroundColor(Color.blue) // Primary color for main headings
                .padding(.bottom, 2)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(Color.gray) // Neutral tone for subtitles
            HStack {
                Text(date)
                Spacer()
                Text(location)
            }
            .font(.caption)
            .foregroundColor(Color.gray) // Neutral tone for captions
            Text(description)
                .font(.body)
                .lineLimit(2)
                .padding(.vertical, 4)
                .foregroundColor(Color.primary) // Ensure readability
            HStack {
                Button(action: {
                    // Add save action
                }) {
                    Text("Save")
                        .font(.subheadline)
                        .padding(6)
                        .background(Color.blue.opacity(0.2)) // Light blue background
                        .foregroundColor(Color.blue) // Blue text for consistency
                        .cornerRadius(8)
                }
                Spacer()
                Button(action: {
                    // Add view details action
                }) {
                    Text("View Details")
                        .font(.subheadline)
                        .padding(6)
                        .background(Color.green.opacity(0.2)) // Light green background
                        .foregroundColor(Color.green) // Green text for positive action
                        .cornerRadius(8)
                }
            }
            .padding(.top, 6)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2) // Subtle shadow for depth
        )
    }
}

struct OpportunityCard_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 16) {
                OpportunityCard(
                    title: "Hackathon 2025",
                    subtitle: "Tech Club",
                    date: "Jan 20, 2025",
                    location: "Room 203",
                    description: "A 12-hour hackathon to showcase your coding skills."
                )
                OpportunityCard(
                    title: "Volunteer Drive",
                    subtitle: "Community Club",
                    date: "Feb 5, 2025",
                    location: "Main Hall",
                    description: "Join us for a day of community service and giving back."
                )
                OpportunityCard(
                    title: "Career Fair",
                    subtitle: "Career Center",
                    date: "Mar 10, 2025",
                    location: "Auditorium",
                    description: "Meet employers and learn about job opportunities."
                )
            }
            .padding()
            .background(Color(UIColor.systemGroupedBackground)) // Soft background for the entire view
        }
        .previewLayout(.sizeThatFits)
    }
}
