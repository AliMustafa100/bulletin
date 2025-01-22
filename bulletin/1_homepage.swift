import SwiftUI

struct SecondView: View {
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            Text("Bulletin")
                .foregroundColor(.white)
                .font(.largeTitle)
        }
    }
}

struct SecondView_Previews: PreviewProvider {
    static var previews: some View {
        SecondView()
    }
}
