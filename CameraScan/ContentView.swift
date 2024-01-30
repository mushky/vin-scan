//
//  ContentView.swift
//  CameraScan
//
//  Created by A Z on 1/28/24.
//

import SwiftUI
import Foundation
import UIKit
import VisionKit

// TODO
// 1. Make API call once [done]
// 2. Parse API return value [done]
// 3. Only make the API call when STOP scan is pressed

struct ContentView: View {
    @State private var isLoading = false
    @State private var apiResponse: String = ""
    @State private var scannedText: String = ""
    @State private var vinInfo: VinInfo?
    @State private var vinFound = false
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Scan VIN")
                    .font(.title)
                    .padding()
                DocumentScannerView { scannedText in
                    self.scannedText = scannedText
                    self.vinFound = true
                    //makeAPICall()
                }
                .navigationBarTitle("")
                .navigationBarHidden(false)
                
                if vinFound {
                    VStack {
                        Text("Scan this VIN #\(scannedText) ?")
                        Button("Look up VIN") {
                            makeAPICall()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(Color.white)
                        .cornerRadius(8)
                    }
                }
                
                if isLoading {
                    ProgressView()
                } else {
                    Text(apiResponse)
                }
            }
        }
    }
    
    func makeAPICall() {
        guard !scannedText.isEmpty, !isLoading else { return }
        isLoading = true // Set isLoading to true when the API call starts
        
        let vin = scannedText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let url = URL(string: "https://api.api-ninjas.com/v1/vinlookup?vin="+vin)!
        var request = URLRequest(url: url)
        request.setValue("hqCrlYgoMZN7erSy1+qjpA==FNqgB7SOfEFbRwJg", forHTTPHeaderField: "X-Api-Key")
        
        let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
            guard let data = data else { return }
            if let responseString = String(data: data, encoding: .utf8) {
                do {
                    let decoder = JSONDecoder()
                    let decodedResponse = try decoder.decode(VinInfo.self, from: data)
                    
                    // Update the UI on the main thread
                    DispatchQueue.main.async {
                        //self.apiResponse = responseString
                        self.apiResponse = "VIN: \(decodedResponse.vin)\nCountry: \(decodedResponse.country)\nManufacturer: \(decodedResponse.manufacturer)\nRegion: \(decodedResponse.region)\nWMI: \(decodedResponse.wmi)\nVDS: \(decodedResponse.vds)\nVIS: \(decodedResponse.vis)\nYears: \(decodedResponse.years)"

                        self.vinInfo = decodedResponse
                        self.isLoading = false // Set isLoading to false when the API call completes
                    }
                } catch {
                    print("Error decoding JSON: \(error)")
                    DispatchQueue.main.async {
                        self.isLoading = false // Set isLoading to false in case of an error
                    }
                }
            }
        }
        task.resume()
    }
   
}

struct VinInfo: Codable {
    var vin: String
    var country: String
    var manufacturer: String
    var region: String
    var wmi: String
    var vds: String
    var vis: String
    var years: [Int]
}

@MainActor
struct DocumentScannerView: UIViewControllerRepresentable { 
    var onScanCompleted: (String) -> Void
    @State private var isLoading = false
    @State private var apiResponse: String = "" // Add this line
    @State private var vinInfo: VinInfo? // Add this line
    @State private var scannedText: String = ""
    
    static let startScanLabel = "Start Scan"
    static let stopScanLabel = "Stop Scan"
    
    static let textDataType: DataScannerViewController.RecognizedDataType = .text(
        languages: [
            "en-US",
            "ja_JP"
        ]
    )
    var scannerViewController: DataScannerViewController = DataScannerViewController(
        recognizedDataTypes: [DocumentScannerView.textDataType, .barcode()],
        qualityLevel: .accurate,
        recognizesMultipleItems: false,
        isHighFrameRateTrackingEnabled: false,
        isHighlightingEnabled: false
    )
    
    func makeUIViewController(context: Context) -> DataScannerViewController {
        scannerViewController.delegate = context.coordinator
        
        // Add a button to start scanning
        let scanButton = UIButton(type: .system)
        scanButton.backgroundColor = UIColor.systemBlue
        scanButton.setTitle(DocumentScannerView.startScanLabel, for: .normal)
        scanButton.setTitleColor(UIColor.white, for: .normal)
        
        var config = UIButton.Configuration.filled()
        config.contentInsets = NSDirectionalEdgeInsets(top: 5, leading: 5, bottom: 5, trailing: 5)
        scanButton.configuration = config
        
        scanButton.addTarget(context.coordinator, action: #selector(Coordinator.startScanning(_:)), for: .touchUpInside)
        scanButton.layer.cornerRadius = 5.0
        scannerViewController.view.addSubview(scanButton)
        
        // Set up button constraints
        scanButton.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            scanButton.centerXAnchor.constraint(equalTo: scannerViewController.view.centerXAnchor),
            scanButton.bottomAnchor.constraint(equalTo: scannerViewController.view.safeAreaLayoutGuide.bottomAnchor, constant: -20)
        ])
        
        return scannerViewController
    }
    
    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {
        // Update any view controller settings here
    }
    
    func makeCoordinator() -> Coordinator {
        return Coordinator(self)
    }
    
    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        var parent: DocumentScannerView
        var roundBoxMappings: [UUID: UIView] = [:]
        
        init(_ parent: DocumentScannerView) {
            self.parent = parent
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            processAddedItems(items: addedItems)
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didRemove removedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            processRemovedItems(items: removedItems)
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didUpdate updatedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            processUpdatedItems(items: updatedItems)
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
            processItem(item: item)
        }
        
        
        func processAddedItems(items: [RecognizedItem]) {
            for item in items {
                processItem(item: item)
            }
        }
        
        func processRemovedItems(items: [RecognizedItem]) {
            for item in items {
                removeRoundBoxFromItem(item: item)
            }
        }
        
        func processUpdatedItems(items: [RecognizedItem]) {
            for item in items {
                updateRoundBoxToItem(item: item)
            }
        }

        func processItem(item: RecognizedItem) {
            switch item {
            case .text(let text):
                print("Text Observation - \(text.observation)")
                print("Text transcript - \(text.transcript)")
                let frame = getRoundBoxFrame(item: item)
                // Adding the round box overlay to detected text
                let transcript = text.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
                if transcript.count == 17 {
                    print("Found Potential VIN#")
                    // If the text has exactly 17 characters, process it
                    addRoundBoxToItem(frame: frame, text: text.transcript, item: item)
                    DispatchQueue.main.async {
                        self.parent.onScanCompleted(transcript)
                        //self.parent.onScanCompleted(
                    }
                }
//                DispatchQueue.main.async {
//                    self.parent.onScanCompleted(text.transcript)
//                }
            case .barcode:
                break
            @unknown default:
                print("Should not happen")
            }
        }
        
        func addRoundBoxToItem(frame: CGRect, text: String, item: RecognizedItem) {
            //let roundedRectView = RoundRectView(frame: frame)
            let roundedRectView = RoundedRectLabel(frame: frame)
            roundedRectView.setText(text: text)
            parent.scannerViewController.overlayContainerView.addSubview(roundedRectView)
            roundBoxMappings[item.id] = roundedRectView
        }
        
        func removeRoundBoxFromItem(item: RecognizedItem) {
            if let roundBoxView = roundBoxMappings[item.id] {
                if roundBoxView.superview != nil {
                    roundBoxView.removeFromSuperview()
                    roundBoxMappings.removeValue(forKey: item.id)
                }
            }
        }
        
        func updateRoundBoxToItem(item: RecognizedItem) {
            if let roundBoxView = roundBoxMappings[item.id] {
                if roundBoxView.superview != nil {
                    let frame = getRoundBoxFrame(item: item)
                    roundBoxView.frame = frame
                }
            }
        }
        
        func getRoundBoxFrame(item: RecognizedItem) -> CGRect {
            let frame = CGRect(
                x: item.bounds.topLeft.x,
                y: item.bounds.topLeft.y,
                width: abs(item.bounds.topRight.x - item.bounds.topLeft.x) + 15,
                height: abs(item.bounds.topLeft.y - item.bounds.bottomLeft.y) + 15
            )
            return frame
        }
        
        @objc func startScanning(_ sender: UIButton) {
            if sender.title(for: .normal) == startScanLabel {
                try? parent.scannerViewController.startScanning()
                sender.setTitle(stopScanLabel, for: .normal)
            } else {
                parent.scannerViewController.stopScanning()
                sender.setTitle(startScanLabel, for: .normal)
            }
        }
    }
    
    
}

class RoundedRectLabel: UIView {
    let label = UILabel()
    let cornerRadius: CGFloat = 5.0
    let padding: CGFloat = 5
    var text: String = ""
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        // Configure the label
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 10)
        label.textAlignment = .left
        label.numberOfLines = 0
        label.text = text
        label.translatesAutoresizingMaskIntoConstraints = false
        
        addSubview(label)
        
        // Add constraints for the label
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: topAnchor, constant: padding),
            label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: padding),
            label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -padding),
            label.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -padding)
        ])
        
        // Configure the background
        backgroundColor = .magenta
        layer.cornerRadius = cornerRadius
        layer.opacity = 0.75
    }
    
    func setText(text: String) {
        label.text = text
        setNeedsDisplay()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

